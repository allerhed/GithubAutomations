# Security Implementation Guide

## Overview

This guide provides practical implementation guidance for developers building the security features described in the security documentation. It includes code examples, architecture patterns, and best practices.

## Authentication Implementation

### User Authentication Service

```typescript
// src/auth/AuthenticationService.ts

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { TwoFactorAuth } from './TwoFactorAuth';
import { AuditLogger } from '../logging/AuditLogger';

export class AuthenticationService {
  private twoFactorAuth: TwoFactorAuth;
  private auditLogger: AuditLogger;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRY: string = '24h';
  private readonly BCRYPT_ROUNDS: number = 12;

  constructor() {
    this.twoFactorAuth = new TwoFactorAuth();
    this.auditLogger = new AuditLogger();
    this.JWT_SECRET = process.env.JWT_SECRET || '';
  }

  /**
   * Authenticate user with username and password
   */
  async authenticate(
    username: string,
    password: string,
    deviceFingerprint?: string
  ): Promise<AuthResult> {
    try {
      // Step 1: Find user
      const user = await User.findByUsername(username);
      if (!user) {
        await this.auditLogger.logAuthFailure(username, 'user_not_found');
        throw new Error('Invalid credentials');
      }

      // Step 2: Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        await this.auditLogger.logAuthFailure(user.id, 'invalid_password');
        await this.handleFailedLogin(user);
        throw new Error('Invalid credentials');
      }

      // Step 3: Check if account is locked
      if (user.isLocked) {
        await this.auditLogger.logAuthFailure(user.id, 'account_locked');
        throw new Error('Account is locked. Contact administrator.');
      }

      // Step 4: Check if 2FA is required
      const requires2FA = await this.check2FARequired(user);
      
      if (requires2FA) {
        // Check if device is trusted
        const isTrusted = deviceFingerprint 
          ? await this.isTrustedDevice(user.id, deviceFingerprint)
          : false;

        if (!isTrusted) {
          // Generate temporary session for 2FA verification
          const tempSession = await this.createTempSession(user);
          return {
            success: false,
            requires2FA: true,
            tempSessionId: tempSession.id,
            methods: await this.get2FAMethods(user.id)
          };
        }
      }

      // Step 5: Create full session
      const token = await this.createSession(user);
      await this.auditLogger.logAuthSuccess(user.id);
      
      return {
        success: true,
        token,
        user: this.sanitizeUser(user)
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify 2FA code and complete authentication
   */
  async verify2FA(
    tempSessionId: string,
    code: string,
    trustDevice: boolean = false,
    deviceFingerprint?: string
  ): Promise<AuthResult> {
    // Get user from temp session
    const tempSession = await this.getTempSession(tempSessionId);
    if (!tempSession || tempSession.isExpired()) {
      throw new Error('Session expired. Please login again.');
    }

    const user = await User.findById(tempSession.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify 2FA code
    const isValid = await this.twoFactorAuth.verifyCode(user.id, code);
    if (!isValid) {
      await this.auditLogger.log2FAFailure(user.id);
      await this.handle2FAFailure(user);
      throw new Error('Invalid verification code');
    }

    // Log successful 2FA
    await this.auditLogger.log2FASuccess(user.id);

    // Trust device if requested
    if (trustDevice && deviceFingerprint) {
      await this.trustDevice(user.id, deviceFingerprint);
    }

    // Create full session
    const token = await this.createSession(user);
    
    // Delete temp session
    await tempSession.delete();

    return {
      success: true,
      token,
      user: this.sanitizeUser(user)
    };
  }

  /**
   * Create JWT session token
   */
  private async createSession(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      groups: await this.getUserVisibilityGroups(user.id)
    };

    const token = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRY,
      issuer: 'SimpleCRM',
      audience: 'SimpleCRM-API'
    });

    return token;
  }

  /**
   * Hash password for storage
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Check if 2FA is required for user
   */
  private async check2FARequired(user: User): Promise<boolean> {
    // Check user's 2FA setting
    const user2FA = await this.twoFactorAuth.getUserConfig(user.id);
    if (user2FA?.isEnabled) {
      return true;
    }

    // Check role-based policy
    const policy = await this.get2FAPolicy();
    if (policy.requiredForRoles.includes(user.role)) {
      return true;
    }

    return false;
  }

  private sanitizeUser(user: User) {
    // Remove sensitive fields before sending to client
    const { passwordHash, totpSecret, ...safeUser } = user;
    return safeUser;
  }
}
```

### 2FA Implementation

```typescript
// src/auth/TwoFactorAuth.ts

import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User2FA } from '../models/User2FA';

export class TwoFactorAuth {
  /**
   * Setup TOTP for user
   */
  async setupTOTP(userId: string): Promise<TOTPSetup> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SimpleCRM (${userId})`,
      issuer: 'SimpleCRM',
      length: 32
    });

    // Store secret temporarily (not enabled yet)
    await User2FA.upsert({
      userId,
      method: 'totp',
      totpSecret: secret.base32,
      isEnabled: false
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    };
  }

  /**
   * Verify TOTP code and enable 2FA
   */
  async verifyAndEnableTOTP(userId: string, code: string): Promise<boolean> {
    const user2FA = await User2FA.findByUserId(userId);
    if (!user2FA || !user2FA.totpSecret) {
      throw new Error('2FA not setup');
    }

    // Verify code
    const isValid = speakeasy.totp.verify({
      secret: user2FA.totpSecret,
      encoding: 'base32',
      token: code,
      window: 1 // Allow 1 time-step before/after
    });

    if (isValid) {
      // Enable 2FA
      user2FA.isEnabled = true;
      user2FA.enabledAt = new Date();
      await user2FA.save();

      // Generate recovery codes
      await this.generateRecoveryCodes(userId);

      return true;
    }

    return false;
  }

  /**
   * Verify 2FA code (TOTP, SMS, Email, or Recovery)
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user2FA = await User2FA.findByUserId(userId);
    if (!user2FA?.isEnabled) {
      return false;
    }

    // Try TOTP first
    if (user2FA.method === 'totp' && user2FA.totpSecret) {
      const isValid = speakeasy.totp.verify({
        secret: user2FA.totpSecret,
        encoding: 'base32',
        token: code,
        window: 1
      });

      if (isValid) {
        user2FA.lastUsedAt = new Date();
        await user2FA.save();
        return true;
      }
    }

    // Try recovery code
    const isRecoveryCode = await this.verifyRecoveryCode(userId, code);
    if (isRecoveryCode) {
      return true;
    }

    // Try SMS/Email code (if applicable)
    // Implementation depends on temporary code storage

    return false;
  }

  /**
   * Generate recovery codes
   */
  async generateRecoveryCodes(userId: string): Promise<string[]> {
    const codes: string[] = [];
    const { RecoveryCode } = await import('../models/RecoveryCode');

    // Delete existing codes
    await RecoveryCode.deleteByUserId(userId);

    // Generate 10 new codes
    for (let i = 0; i < 10; i++) {
      const code = this.generateRandomCode(10);
      const hash = await bcrypt.hash(code, 12);
      
      await RecoveryCode.create({
        userId,
        codeHash: hash,
        isUsed: false
      });

      codes.push(code);
    }

    return codes;
  }

  /**
   * Verify recovery code
   */
  private async verifyRecoveryCode(userId: string, code: string): Promise<boolean> {
    const { RecoveryCode } = await import('../models/RecoveryCode');
    const recoveryCodes = await RecoveryCode.findByUserId(userId);

    for (const recoveryCode of recoveryCodes) {
      if (recoveryCode.isUsed) continue;

      const isMatch = await bcrypt.compare(code, recoveryCode.codeHash);
      if (isMatch) {
        // Mark as used
        recoveryCode.isUsed = true;
        recoveryCode.usedAt = new Date();
        await recoveryCode.save();

        // Check if running low on codes
        const remaining = await RecoveryCode.countUnused(userId);
        if (remaining <= 3) {
          // Send notification to user
          await this.notifyLowRecoveryCodes(userId);
        }

        return true;
      }
    }

    return false;
  }

  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
```

## Authorization Implementation

### Permission Middleware

```typescript
// src/middleware/authorization.ts

import { Request, Response, NextFunction } from 'express';
import { AuthorizationService } from '../auth/AuthorizationService';

export interface AuthRequest extends Request {
  user: {
    userId: string;
    role: string;
    groups: string[];
  };
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(...roles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

/**
 * Middleware to check if user can access a specific resource
 */
export function requireResourceAccess(resourceType: string, accessLevel: 'view' | 'edit' | 'full' = 'view') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const authService = new AuthorizationService();

    const hasAccess = await authService.canAccessResource(
      req.user.userId,
      resourceType,
      resourceId,
      accessLevel
    );

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this resource' });
    }

    next();
  };
}

/**
 * Middleware to filter list results by visibility
 */
export function filterByVisibility(resourceType: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authService = new AuthorizationService();
    
    // Add visibility filter to query
    req.visibilityFilter = await authService.getVisibilityFilter(
      req.user.userId,
      resourceType
    );

    next();
  };
}
```

### Authorization Service

```typescript
// src/auth/AuthorizationService.ts

import { User } from '../models/User';
import { RecordVisibility } from '../models/RecordVisibility';
import { VisibilityGroup } from '../models/VisibilityGroup';

export class AuthorizationService {
  /**
   * Check if user can access a specific resource
   */
  async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    requiredLevel: 'view' | 'edit' | 'full'
  ): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) return false;

    // Admins have full access
    if (user.role === 'admin') {
      return true;
    }

    // Check if user owns the resource
    const resource = await this.getResource(resourceType, resourceId);
    if (resource.ownerId === userId) {
      return true;
    }

    // Check visibility groups
    const userGroups = await this.getUserGroups(userId);
    const resourceVisibility = await RecordVisibility.find({
      recordType: resourceType,
      recordId: resourceId,
      groupId: { $in: userGroups.map(g => g.id) }
    });

    if (resourceVisibility.length > 0) {
      // Check if any group grants sufficient access
      const hasAccess = resourceVisibility.some(rv => 
        this.hasRequiredAccess(rv.accessLevel, requiredLevel)
      );
      return hasAccess;
    }

    // Check hierarchical visibility (manager sees team records)
    if (user.role === 'manager') {
      const isTeamMember = await this.isInTeam(user.id, resource.ownerId);
      if (isTeamMember) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get SQL WHERE clause for visibility filtering
   */
  async getVisibilityFilter(userId: string, resourceType: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) return '1=0'; // No access

    // Admin sees everything
    if (user.role === 'admin') {
      return '1=1';
    }

    const userGroups = await this.getUserGroups(userId);
    const groupIds = userGroups.map(g => `'${g.id}'`).join(',');

    // Build visibility filter
    const filter = `
      (
        ${resourceType}.owner_id = '${userId}'
        OR ${resourceType}.visibility = 'public'
        OR EXISTS (
          SELECT 1 FROM record_visibility rv
          INNER JOIN group_members gm ON rv.group_id = gm.group_id
          WHERE rv.record_type = '${resourceType}'
            AND rv.record_id = ${resourceType}.id
            AND gm.user_id = '${userId}'
        )
        ${user.role === 'manager' ? this.getHierarchicalFilter(userId, resourceType) : ''}
      )
    `;

    return filter;
  }

  /**
   * Share resource with visibility group
   */
  async shareResource(
    resourceType: string,
    resourceId: string,
    groupId: string,
    accessLevel: 'view' | 'edit' | 'full',
    grantedBy: string
  ): Promise<void> {
    await RecordVisibility.upsert({
      recordType: resourceType,
      recordId: resourceId,
      groupId: groupId,
      accessLevel: accessLevel,
      grantedBy: grantedBy,
      grantedAt: new Date()
    });

    // Log the sharing event
    await this.auditLogger.logResourceShared(
      resourceType,
      resourceId,
      groupId,
      accessLevel,
      grantedBy
    );
  }

  /**
   * Revoke resource access from visibility group
   */
  async unshareResource(
    resourceType: string,
    resourceId: string,
    groupId: string,
    revokedBy: string
  ): Promise<void> {
    await RecordVisibility.delete({
      recordType: resourceType,
      recordId: resourceId,
      groupId: groupId
    });

    // Log the unsharing event
    await this.auditLogger.logResourceUnshared(
      resourceType,
      resourceId,
      groupId,
      revokedBy
    );
  }

  private hasRequiredAccess(granted: string, required: string): boolean {
    const levels = { view: 1, edit: 2, full: 3 };
    return levels[granted] >= levels[required];
  }

  private getHierarchicalFilter(managerId: string, resourceType: string): string {
    return `
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = ${resourceType}.owner_id
          AND u.manager_id = '${managerId}'
      )
    `;
  }
}
```

## Visibility Groups Implementation

```typescript
// src/services/VisibilityGroupService.ts

import { VisibilityGroup } from '../models/VisibilityGroup';
import { GroupMember } from '../models/GroupMember';
import { VisibilityRule } from '../models/VisibilityRule';

export class VisibilityGroupService {
  /**
   * Create a new visibility group
   */
  async createGroup(
    name: string,
    description: string,
    type: 'manual' | 'automatic',
    createdBy: string
  ): Promise<VisibilityGroup> {
    const group = await VisibilityGroup.create({
      name,
      description,
      type,
      createdBy,
      isActive: true
    });

    return group;
  }

  /**
   * Add user to visibility group
   */
  async addMember(
    groupId: string,
    userId: string,
    addedBy: string
  ): Promise<void> {
    await GroupMember.create({
      groupId,
      userId,
      addedBy,
      joinedAt: new Date()
    });

    // Invalidate user's group cache
    await this.invalidateUserGroupCache(userId);
  }

  /**
   * Remove user from visibility group
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    await GroupMember.delete({ groupId, userId });
    
    // Invalidate user's group cache
    await this.invalidateUserGroupCache(userId);
  }

  /**
   * Apply automatic visibility rules
   */
  async applyAutomaticRules(
    resourceType: string,
    resourceId: string,
    resourceData: any
  ): Promise<void> {
    // Get all active automatic rules for this resource type
    const rules = await VisibilityRule.find({
      recordType: resourceType,
      isActive: true
    });

    for (const rule of rules) {
      const matches = this.evaluateRule(rule, resourceData);
      if (matches) {
        // Share with the group
        await RecordVisibility.upsert({
          recordType: resourceType,
          recordId: resourceId,
          groupId: rule.groupId,
          accessLevel: rule.accessLevel,
          grantedBy: 'system',
          grantedAt: new Date()
        });
      }
    }
  }

  /**
   * Evaluate if resource matches visibility rule
   */
  private evaluateRule(rule: VisibilityRule, data: any): boolean {
    const fieldValue = data[rule.conditionField];
    
    switch (rule.conditionOperator) {
      case 'equals':
        return fieldValue === rule.conditionValue;
      case 'not_equals':
        return fieldValue !== rule.conditionValue;
      case 'greater_than':
        return Number(fieldValue) > Number(rule.conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(rule.conditionValue);
      case 'contains':
        return String(fieldValue).includes(rule.conditionValue);
      case 'in_list':
        const list = rule.conditionValue.split(',');
        return list.includes(String(fieldValue));
      default:
        return false;
    }
  }

  private async invalidateUserGroupCache(userId: string): Promise<void> {
    // Implementation depends on caching strategy (Redis, in-memory, etc.)
    // Example with Redis:
    // await redis.del(`user:${userId}:groups`);
  }
}
```

## Security Best Practices

### Input Validation

```typescript
// src/validation/validators.ts

import { body, param, query, ValidationChain } from 'express-validator';

export const dealValidators = {
  create: [
    body('title').trim().isLength({ min: 1, max: 255 }).escape(),
    body('value').isFloat({ min: 0 }),
    body('ownerId').isUUID(),
    body('stageId').isUUID(),
    body('expectedCloseDate').optional().isISO8601(),
    body('visibility').optional().isIn(['private', 'team', 'public'])
  ],
  
  update: [
    param('id').isUUID(),
    body('title').optional().trim().isLength({ min: 1, max: 255 }).escape(),
    body('value').optional().isFloat({ min: 0 }),
    body('stageId').optional().isUUID()
  ]
};

export const visibilityGroupValidators = {
  create: [
    body('name').trim().isLength({ min: 1, max: 100 }).escape(),
    body('description').optional().trim().isLength({ max: 500 }).escape(),
    body('type').isIn(['manual', 'automatic'])
  ],
  
  addMember: [
    param('groupId').isUUID(),
    body('userId').isUUID()
  ]
};
```

### Error Handling

```typescript
// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { AuditLogger } from '../logging/AuditLogger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auditLogger = new AuditLogger();
  
  // Log error
  auditLogger.logError(err, {
    userId: req.user?.userId,
    path: req.path,
    method: req.method
  });

  // Don't expose internal errors to client
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Access denied'
    });
  }

  // Generic error response
  res.status(500).json({
    error: 'Internal server error'
  });
}
```

## Testing

### Authentication Tests

```typescript
// tests/auth/authentication.test.ts

import { AuthenticationService } from '../../src/auth/AuthenticationService';
import { User } from '../../src/models/User';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    authService = new AuthenticationService();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      const result = await authService.authenticate('testuser', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user.username).toBe('testuser');
    });

    it('should reject invalid password', async () => {
      await expect(
        authService.authenticate('testuser', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should require 2FA for admin users', async () => {
      const result = await authService.authenticate('admin', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.requires2FA).toBe(true);
      expect(result.tempSessionId).toBeDefined();
    });
  });

  describe('verify2FA', () => {
    it('should complete login with valid 2FA code', async () => {
      // Setup
      const tempResult = await authService.authenticate('admin', 'password123');
      const validCode = '123456'; // Mock valid code

      // Test
      const result = await authService.verify2FA(tempResult.tempSessionId, validCode);
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should reject invalid 2FA code', async () => {
      const tempResult = await authService.authenticate('admin', 'password123');
      
      await expect(
        authService.verify2FA(tempResult.tempSessionId, '000000')
      ).rejects.toThrow('Invalid verification code');
    });
  });
});
```

### Authorization Tests

```typescript
// tests/auth/authorization.test.ts

import { AuthorizationService } from '../../src/auth/AuthorizationService';

describe('AuthorizationService', () => {
  let authService: AuthorizationService;

  beforeEach(() => {
    authService = new AuthorizationService();
  });

  describe('canAccessResource', () => {
    it('should allow owner to access their own resource', async () => {
      const canAccess = await authService.canAccessResource(
        'user-123',
        'deal',
        'deal-456',
        'edit'
      );

      expect(canAccess).toBe(true);
    });

    it('should deny access to resource outside visibility', async () => {
      const canAccess = await authService.canAccessResource(
        'user-123',
        'deal',
        'deal-789', // Owned by someone else, not shared
        'view'
      );

      expect(canAccess).toBe(false);
    });

    it('should allow access through visibility group', async () => {
      // Setup: Share deal-789 with group that user-123 belongs to
      await authService.shareResource('deal', 'deal-789', 'group-1', 'view', 'admin');

      const canAccess = await authService.canAccessResource(
        'user-123',
        'deal',
        'deal-789',
        'view'
      );

      expect(canAccess).toBe(true);
    });

    it('should deny access if access level insufficient', async () => {
      // Setup: Share with view-only access
      await authService.shareResource('deal', 'deal-789', 'group-1', 'view', 'admin');

      const canAccess = await authService.canAccessResource(
        'user-123',
        'deal',
        'deal-789',
        'edit' // Requires edit but only has view
      );

      expect(canAccess).toBe(false);
    });

    it('should allow admin full access to all resources', async () => {
      const canAccess = await authService.canAccessResource(
        'admin-user',
        'deal',
        'any-deal-id',
        'full'
      );

      expect(canAccess).toBe(true);
    });
  });
});
```

## Deployment Checklist

### Pre-Production

- [ ] All environment variables configured (JWT_SECRET, DB credentials, etc.)
- [ ] Database migrations run successfully
- [ ] SSL/TLS certificates installed
- [ ] 2FA configured for all admin accounts
- [ ] Audit logging enabled
- [ ] Monitoring and alerting configured
- [ ] Backup strategy tested
- [ ] Security headers configured (HSTS, CSP, etc.)

### Production Launch

- [ ] Change default admin credentials
- [ ] Enable rate limiting
- [ ] Configure WAF rules
- [ ] Set up intrusion detection
- [ ] Enable automated backups
- [ ] Configure log retention
- [ ] Set up security monitoring dashboard
- [ ] Document incident response procedures

### Post-Launch

- [ ] Conduct penetration testing
- [ ] Review audit logs weekly
- [ ] Monitor failed authentication attempts
- [ ] Review user access quarterly
- [ ] Update security documentation
- [ ] Schedule SOC 2 audit

## Additional Resources

- [User Roles and Permissions](user-roles-permissions.md)
- [Visibility Groups](visibility-groups.md)
- [Two-Factor Authentication](two-factor-authentication.md)
- [SOC 2 Compliance](soc2-compliance.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
