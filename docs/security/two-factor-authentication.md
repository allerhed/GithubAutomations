# Two-Factor Authentication (2FA)

## Overview

Two-Factor Authentication (2FA) adds an essential security layer to SimpleCRM by requiring users to provide two forms of identification before accessing their accounts. This significantly reduces the risk of unauthorized access, even if passwords are compromised.

## Purpose

2FA protects against:
- **Compromised Passwords**: Even if a password is stolen, the attacker cannot access the account without the second factor
- **Phishing Attacks**: Reduces effectiveness of credential-stealing phishing attempts
- **Credential Stuffing**: Prevents automated attacks using leaked credentials from other services
- **Insider Threats**: Adds accountability by requiring physical device access
- **Compliance Requirements**: Meets security standards like SOC 2, GDPR, and HIPAA

## Supported 2FA Methods

### 1. Time-Based One-Time Password (TOTP)

**Recommended Method** - Uses authenticator apps to generate time-sensitive codes.

**Supported Apps**:
- Google Authenticator (iOS, Android)
- Microsoft Authenticator (iOS, Android)
- Authy (iOS, Android, Desktop)
- 1Password (with TOTP support)
- Bitwarden (premium feature)

**Setup Process**:
1. User navigates to Security Settings
2. Clicks "Enable Two-Factor Authentication"
3. System generates QR code with secret key
4. User scans QR code with authenticator app
5. User enters 6-digit code from app to verify
6. System provides recovery codes for backup
7. 2FA is activated

**Authentication Flow**:
1. User enters username and password
2. System validates credentials
3. If valid, system prompts for 6-digit TOTP code
4. User opens authenticator app and enters current code
5. System validates code (30-second time window)
6. If valid, user is granted access

**Advantages**:
- No dependency on SMS/email delivery
- Works offline
- More secure than SMS
- Widely supported across platforms
- Free for users

**Configuration**:
```json
{
  "totp": {
    "enabled": true,
    "algorithm": "SHA1",
    "digits": 6,
    "period": 30,
    "window": 1,
    "issuer": "SimpleCRM"
  }
}
```

### 2. SMS-Based Verification

**Fallback Method** - Sends verification codes via text message.

**Setup Process**:
1. User adds and verifies phone number
2. User enables SMS 2FA in security settings
3. System sends test code to verify number
4. User enters code to confirm
5. SMS 2FA is activated

**Authentication Flow**:
1. User enters username and password
2. System sends 6-digit code via SMS
3. User enters code from text message
4. System validates code (10-minute expiration)
5. If valid, user is granted access

**Advantages**:
- No app installation required
- Familiar to most users
- Works on any mobile phone

**Limitations**:
- Vulnerable to SIM swapping attacks
- Depends on cellular network availability
- May incur SMS costs
- Not recommended for high-security scenarios

**Configuration**:
```json
{
  "sms": {
    "enabled": true,
    "code_length": 6,
    "expiry_minutes": 10,
    "rate_limit_per_hour": 5,
    "provider": "twilio",
    "template": "Your SimpleCRM verification code is: {code}. Valid for 10 minutes."
  }
}
```

### 3. Email-Based Verification

**Emergency Method** - Sends verification codes via email.

**Setup Process**:
- Automatically available for all users with verified email addresses
- Can be enabled as backup method

**Authentication Flow**:
1. User enters username and password
2. System sends 6-digit code to registered email
3. User retrieves code from email
4. User enters code in SimpleCRM
5. System validates code (15-minute expiration)
6. If valid, user is granted access

**Use Cases**:
- Backup when primary 2FA method unavailable
- Device loss recovery
- New device enrollment

**Configuration**:
```json
{
  "email": {
    "enabled": true,
    "code_length": 6,
    "expiry_minutes": 15,
    "rate_limit_per_hour": 3,
    "subject": "SimpleCRM - Verification Code",
    "template": "email/2fa-code.html"
  }
}
```

### 4. Hardware Security Keys (Future Enhancement)

**Enterprise Method** - Physical USB/NFC keys (e.g., YubiKey, Google Titan).

**Planned Features**:
- WebAuthn/FIDO2 support
- USB and NFC key registration
- Backup key enrollment
- Enterprise bulk provisioning

## Recovery Mechanisms

### Recovery Codes

One-time use backup codes for emergency access.

**Generation**:
- System generates 10 unique recovery codes when 2FA is enabled
- Each code is 8-10 characters (alphanumeric)
- Codes are displayed once and must be saved by user
- Codes are securely hashed in database

**Usage**:
- User can enter recovery code instead of 2FA code
- Each code is single-use and invalidated after use
- Remaining codes shown after successful recovery
- User should generate new codes if running low

**Best Practices**:
- Store codes in secure password manager
- Print and store in physical safe
- Never store in same location as password
- Generate new codes after using any recovery code

**Configuration**:
```json
{
  "recovery_codes": {
    "count": 10,
    "length": 10,
    "charset": "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "bcrypt_rounds": 12,
    "regenerate_threshold": 3
  }
}
```

### Account Recovery Process

For users who lose both 2FA device and recovery codes:

**Self-Service Recovery** (if pre-configured):
1. User clicks "Can't access your 2FA device?"
2. System sends recovery link to verified backup email
3. User must answer security questions
4. System temporarily disables 2FA
5. User logs in and sets up new 2FA method

**Admin-Assisted Recovery**:
1. User contacts support/admin team
2. Admin verifies identity (via established protocol)
3. Admin temporarily disables 2FA for account
4. User logs in with password only
5. User required to set up 2FA immediately
6. All security events logged for audit

**Recovery Workflow**:
```
User Request → Identity Verification → Security Questions → 
Manager Approval → Admin Action → 2FA Disabled (24hr) → 
User Login → Force 2FA Setup → Security Notification
```

## Role-Based 2FA Policies

### Policy Enforcement Levels

**Level 1: Required for All Users**
- All users must enable 2FA to access SimpleCRM
- Enforced immediately upon policy activation
- Grace period: 7 days to set up (then blocked)

**Level 2: Required for Admins and Managers**
- Admin and Manager roles must enable 2FA
- Sales Reps and Marketing roles: optional
- Automatic enforcement on role assignment

**Level 3: Optional but Recommended**
- 2FA available but not mandatory
- Dashboard prompts encourage adoption
- Monthly security reminders

**Level 4: Required for Remote Access**
- 2FA required only when accessing from non-whitelisted IPs
- Office network access: password only
- Remote/VPN access: password + 2FA

**Configuration**:
```json
{
  "2fa_policy": {
    "enforcement_level": "required_for_admins_managers",
    "grace_period_days": 7,
    "remember_device_days": 30,
    "trusted_ip_ranges": ["10.0.0.0/8", "192.168.1.0/24"],
    "require_for_api_access": true,
    "require_for_mobile": false
  }
}
```

## Implementation Architecture

### Database Schema

```sql
-- User 2FA Configuration table
CREATE TABLE user_2fa (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    method ENUM('totp', 'sms', 'email') NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    totp_secret VARCHAR(32),
    phone_number VARCHAR(20),
    backup_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    enabled_at TIMESTAMP,
    last_used_at TIMESTAMP,
    INDEX idx_user_lookup (user_id)
);

-- Recovery Codes table
CREATE TABLE recovery_codes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP,
    INDEX idx_user_codes (user_id, is_used)
);

-- Trusted Devices table
CREATE TABLE trusted_devices (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(255) NOT NULL,
    device_name VARCHAR(100),
    last_ip VARCHAR(45),
    user_agent TEXT,
    trusted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    INDEX idx_device_lookup (user_id, device_fingerprint)
);

-- 2FA Audit Log table
CREATE TABLE twofa_audit_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type ENUM('setup', 'login_success', 'login_failure', 'recovery_used', 'disabled', 'method_changed'),
    method ENUM('totp', 'sms', 'email', 'recovery_code'),
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_events (user_id, created_at),
    INDEX idx_failures (success, created_at)
);
```

### API Endpoints

#### 2FA Setup

```
POST   /api/v1/auth/2fa/setup/totp           Initialize TOTP setup
POST   /api/v1/auth/2fa/setup/totp/verify    Complete TOTP setup
POST   /api/v1/auth/2fa/setup/sms            Setup SMS 2FA
POST   /api/v1/auth/2fa/setup/email          Setup email 2FA
DELETE /api/v1/auth/2fa                      Disable 2FA
```

#### Authentication

```
POST   /api/v1/auth/login                    Primary login (username/password)
POST   /api/v1/auth/2fa/verify               Verify 2FA code
POST   /api/v1/auth/2fa/resend               Resend 2FA code (SMS/email)
```

#### Recovery

```
POST   /api/v1/auth/2fa/recovery             Use recovery code
GET    /api/v1/auth/2fa/recovery-codes       Get remaining recovery codes
POST   /api/v1/auth/2fa/recovery-codes/regenerate  Generate new codes
POST   /api/v1/auth/2fa/recovery/request     Request account recovery
```

#### Device Trust

```
POST   /api/v1/auth/2fa/trust-device         Mark current device as trusted
GET    /api/v1/auth/2fa/trusted-devices      List trusted devices
DELETE /api/v1/auth/2fa/trusted-devices/:id  Revoke device trust
```

### Authentication Flow Implementation

```javascript
// Pseudo-code for 2FA authentication flow
async function authenticate(username, password, totpCode, deviceFingerprint) {
  // Step 1: Validate credentials
  const user = await validateCredentials(username, password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Step 2: Check if 2FA is required
  const requires2FA = await check2FARequired(user);
  if (!requires2FA) {
    return generateSessionToken(user);
  }
  
  // Step 3: Check if device is trusted
  const isTrustedDevice = await checkTrustedDevice(user.id, deviceFingerprint);
  if (isTrustedDevice) {
    return generateSessionToken(user);
  }
  
  // Step 4: Require 2FA code
  if (!totpCode) {
    return { requires2FA: true, sessionId: generateTempSession(user) };
  }
  
  // Step 5: Verify 2FA code
  const isValid = await verify2FACode(user.id, totpCode);
  if (!isValid) {
    await logFailedAttempt(user.id);
    throw new Error('Invalid 2FA code');
  }
  
  // Step 6: Create session
  await logSuccessful2FA(user.id);
  return generateSessionToken(user);
}
```

## User Experience

### Setup Wizard

**Step 1: Choose Method**
- Display available 2FA methods with pros/cons
- Recommend TOTP as primary method
- Show security badges for each option

**Step 2: Configure**
- For TOTP: Display QR code and manual entry key
- For SMS: Collect and verify phone number
- For Email: Confirm backup email

**Step 3: Verify**
- User enters code to prove setup works
- Retry option if code fails
- Help link for troubleshooting

**Step 4: Save Recovery Codes**
- Display recovery codes in printable format
- Require user to download or copy codes
- Checkbox confirmation: "I have saved these codes"
- Warning about importance of secure storage

**Step 5: Success**
- Confirmation message
- Summary of enabled method
- Option to add additional backup methods
- Link to security settings

### Login Experience

**Without Trusted Device**:
1. Enter username and password
2. Click "Sign In"
3. Redirected to 2FA verification page
4. Enter 6-digit code from authenticator app
5. Optional: Check "Trust this device for 30 days"
6. Click "Verify"
7. Access granted

**With Trusted Device**:
1. Enter username and password
2. Click "Sign In"
3. Immediate access (no 2FA prompt)
4. Security notification: "Signed in from trusted device"

**Fallback Flow**:
1. Click "Having trouble with your code?"
2. Choose alternative: "Use recovery code" or "Send code to email"
3. Enter alternative code
4. Access granted with prompt to fix primary method

## Security Considerations

### Code Generation

**TOTP Security**:
- Use industry-standard TOTP (RFC 6238)
- 30-second time window
- Allow 1 window drift (±30 seconds)
- Secret keys: 160-bit random values
- Secrets encrypted at rest

**SMS/Email Security**:
- Codes: 6-digit numeric (1 million combinations)
- Short expiration (10-15 minutes)
- Rate limiting: 5 attempts per hour
- Invalidate after successful use
- No code reuse

### Brute Force Protection

1. **Account Lockout**: Lock account after 5 failed 2FA attempts (15-minute timeout)
2. **Rate Limiting**: Maximum 10 verification attempts per hour per user
3. **IP-Based Throttling**: Slow down requests from suspicious IPs
4. **CAPTCHA**: Require CAPTCHA after 3 failed attempts
5. **Alert Admins**: Notify security team of repeated failures

### Session Management

1. **Session Lifetime**: 2FA-authenticated sessions valid for 24 hours
2. **Idle Timeout**: Auto-logout after 60 minutes of inactivity
3. **Concurrent Sessions**: Limit to 3 active sessions per user
4. **Session Revocation**: Ability to kill all sessions on security breach
5. **Device Tracking**: Log device fingerprint for each session

### Audit and Monitoring

Log all 2FA events:
- Setup and configuration changes
- Successful authentications
- Failed authentication attempts
- Recovery code usage
- Method changes
- Device trust grants/revocations

**Alert Triggers**:
- Multiple failed 2FA attempts from single account
- 2FA disabled for Admin/Manager account
- Recovery code usage (notify user)
- Login from new country/unusual location
- Multiple accounts from same IP with failed 2FA

## Compliance and Standards

### SOC 2 Requirements

2FA implementation supports SOC 2 compliance:
- **CC6.1**: Implements logical access controls (2FA is strong authentication)
- **CC6.2**: Restricts access to sensitive data (2FA protects CRM data)
- **CC6.3**: Manages credentials (2FA adds authentication layer)
- **CC6.7**: Restricts transmission of data (2FA prevents unauthorized access)

### GDPR Considerations

- **User Consent**: Clear explanation of 2FA and opt-in process
- **Data Minimization**: Only collect necessary data (phone number if SMS used)
- **Right to Deletion**: Remove 2FA data when user account deleted
- **Transparency**: Clear communication about 2FA data storage and use

### Industry Best Practices

- Follow NIST SP 800-63B Digital Identity Guidelines
- Implement time-based OTP per RFC 6238
- Use secure random number generation for secrets
- Encrypt secrets at rest (AES-256)
- Transmit codes over secure channels only
- Provide clear user documentation

## Testing Requirements

### Functional Tests

1. Test TOTP setup flow end-to-end
2. Test SMS code delivery and verification
3. Test email code delivery and verification
4. Test recovery code generation and usage
5. Test device trust functionality
6. Test 2FA disable/re-enable flow
7. Test backup method fallback
8. Test policy enforcement for different roles

### Security Tests

1. Test time window tolerance for TOTP codes
2. Test rate limiting on verification attempts
3. Test account lockout after failed attempts
4. Test recovery code single-use enforcement
5. Test device fingerprinting effectiveness
6. Test session management with 2FA
7. Attempt replay attacks with used codes
8. Test code expiration enforcement

### User Experience Tests

1. Test setup wizard usability
2. Test login flow with 2FA on multiple devices
3. Test error messages and help text clarity
4. Test recovery process usability
5. Test mobile vs desktop experience
6. Test accessibility (screen readers, keyboard navigation)

### Integration Tests

1. Test 2FA with SSO/SAML integration
2. Test API authentication with 2FA
3. Test mobile app 2FA flows
4. Test 2FA with password reset flow
5. Test 2FA with account provisioning

## Rollout Strategy

### Phase 1: Foundation (Week 1)
- Deploy 2FA database schema
- Implement TOTP method backend
- Build setup and verification APIs
- Create recovery code system

### Phase 2: UI Development (Week 2)
- Build setup wizard UI
- Implement login flow with 2FA
- Create security settings page
- Develop admin 2FA management console

### Phase 3: Testing (Week 3)
- Conduct security testing
- Perform usability testing
- Test with pilot group (20 users)
- Gather feedback and iterate

### Phase 4: Pilot Rollout (Week 4)
- Enable 2FA for Admin users (mandatory)
- Enable 2FA for Manager users (mandatory)
- Optional 2FA available for all other users
- Provide training materials and support

### Phase 5: Full Deployment (Week 5-6)
- Announce 2FA availability to all users
- Gradual enforcement for Sales Rep and Marketing
- Monitor adoption rates and support tickets
- Conduct post-deployment security audit

## Training and Documentation

### User Documentation

- **Quick Start Guide**: Step-by-step 2FA setup with screenshots
- **FAQ**: Common questions and troubleshooting
- **Video Tutorials**: Setup walkthrough for each method
- **Recovery Guide**: What to do if locked out

### Admin Documentation

- **Policy Configuration**: How to set and enforce 2FA policies
- **User Support**: Handling account recovery requests
- **Monitoring Guide**: Understanding 2FA audit logs
- **Security Incidents**: Response procedures for 2FA bypass attempts

## Support and Troubleshooting

### Common Issues

**Issue**: "Code doesn't work"
- **Causes**: Time sync issue, wrong method selected, expired code
- **Solutions**: Check device time, verify correct app, try new code

**Issue**: "Lost access to authenticator app"
- **Solutions**: Use recovery code, use SMS backup, contact admin

**Issue**: "Not receiving SMS codes"
- **Causes**: Phone number incorrect, carrier delay, SMS blocked
- **Solutions**: Verify number, wait 5 minutes, use email backup

**Issue**: "Device not recognized as trusted"
- **Causes**: Cookies cleared, private browsing, different browser
- **Solutions**: Re-authenticate with 2FA, trust device again

### Support Process

1. **User Self-Service**: Documentation, FAQs, video guides
2. **Help Desk**: Tier 1 support for common issues
3. **Admin Assistance**: Account recovery and 2FA reset
4. **Security Team**: Escalation for security incidents

## Future Enhancements

1. **Biometric Authentication**: Face ID, Touch ID, fingerprint
2. **Push Notifications**: Approve login via mobile app push
3. **Risk-Based Authentication**: Adaptive 2FA based on risk scoring
4. **WebAuthn/FIDO2**: Passwordless authentication with security keys
5. **Behavioral Biometrics**: Typing patterns, mouse movements
6. **Conditional 2FA**: Require only for sensitive operations
7. **Single Sign-On (SSO)**: Integration with enterprise IdP
