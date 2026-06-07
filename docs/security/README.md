# Security Overview

## Introduction

SimpleCRM is built with security as a foundational principle. This document provides an overview of our comprehensive security architecture and controls designed to protect sensitive customer and sales data.

## Security Pillars

Our security approach is built on four fundamental pillars:

### 1. **Access Control**
Ensure only authorized users can access the system and data
- Role-based access control (RBAC)
- Multi-factor authentication (2FA)
- Visibility groups for data segmentation
- Session management and timeout policies

### 2. **Data Protection**
Protect data confidentiality, integrity, and availability
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.2+)
- Secure backup and recovery
- Data retention and disposal policies

### 3. **Monitoring & Response**
Detect and respond to security events
- Continuous security monitoring (24/7)
- Audit logging and analysis
- Incident response procedures
- Vulnerability management program

### 4. **Compliance**
Meet industry standards and regulatory requirements
- SOC 2 Type II certification
- GDPR compliance
- Regular security audits
- Third-party penetration testing

## Key Security Features

### User Authentication

**Multi-Factor Authentication (2FA)**
- Required for all Admin and Manager accounts
- Available for all user roles
- Multiple methods: TOTP, SMS, Email
- Recovery codes for backup access
- Trusted device management

**Password Security**
- Minimum 12 characters with complexity requirements
- Bcrypt hashing (work factor: 12+)
- 90-day rotation policy for privileged accounts
- Password breach detection
- No password reuse (last 10 passwords)

**Session Management**
- Secure session tokens (JWT or similar)
- 60-minute idle timeout
- 24-hour absolute timeout for standard users
- 8-hour absolute timeout for admin users
- Concurrent session limits (3 per user)

→ **Learn more**: [Two-Factor Authentication](two-factor-authentication.md)

### Authorization & Permissions

**Role-Based Access Control (RBAC)**

Four primary roles with distinct permissions:

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | System administrators | Full access to all data and settings |
| **Manager** | Team supervisors | Access to team data and management tools |
| **Sales Rep** | Individual contributors | Access to own and shared data |
| **Marketing** | Marketing team | Lead management and campaign analytics |

**Permission Enforcement**
- Server-side authorization checks on all API endpoints
- Frontend restrictions for better user experience
- Real-time permission updates (no cache lag)
- Audit logging of all permission changes

→ **Learn more**: [User Roles and Permissions](user-roles-permissions.md)

### Data Access Control

**Visibility Groups**

Fine-grained control over who can access specific records:
- Team-based segmentation (e.g., North America Sales Team)
- Territory management (geographic or industry)
- Project-based temporary access
- Hierarchical visibility (managers see team data)
- Access levels: View, Edit, Full

**Owner-Based Access**
- Users always have full access to their own records
- Explicit sharing required for others to access
- Public/Private visibility settings per record

**Data Isolation**
- Multi-tenant architecture with complete data separation
- Customer data never shared between organizations
- Separate database schemas per customer (optional for Enterprise)

→ **Learn more**: [Visibility Groups](visibility-groups.md)

### Data Encryption

**Encryption at Rest**
- AES-256 encryption for all databases
- Encrypted file storage (documents, attachments)
- Encrypted backup storage
- Hardware security modules (HSM) for key management

**Encryption in Transit**
- TLS 1.2 or higher for all network communication
- HTTPS enforced for all web traffic
- HSTS (HTTP Strict Transport Security) enabled
- Certificate pinning for mobile apps

**Key Management**
- Centralized key management service (AWS KMS, Azure Key Vault)
- Automatic key rotation (annually)
- Separate keys per customer (Enterprise plan)
- Audit logging of all key access

### Network Security

**Perimeter Security**
- Web Application Firewall (WAF) with OWASP rule sets
- DDoS protection (cloud-based)
- Rate limiting on all API endpoints
- IP whitelisting for administrative access (optional)

**Network Segmentation**
- Separate networks: Production, Staging, Corporate
- VPN required for internal system access
- Bastion hosts for production access
- No direct internet access to databases

**Intrusion Detection/Prevention**
- Network-based IDS/IPS
- Host-based intrusion detection
- Anomaly detection and alerting
- Automated blocking of suspicious IPs

### Application Security

**Secure Development Lifecycle**
- Security requirements in design phase
- Threat modeling for new features
- Secure coding training for developers
- Code review required (minimum 2 reviewers)
- Static Application Security Testing (SAST)
- Dynamic Application Security Testing (DAST)

**Input Validation**
- Server-side validation for all inputs
- Parameterized queries (prevent SQL injection)
- Output encoding (prevent XSS)
- File upload restrictions (type, size, scanning)
- CSRF protection on all state-changing operations

**Dependency Management**
- Automated dependency scanning
- Vulnerability alerts for dependencies
- Rapid patching process (critical: 7 days, high: 30 days)
- Regular dependency updates

**API Security**
- API authentication (OAuth 2.0, API keys)
- Rate limiting per user/API key
- Request/response validation
- API versioning and deprecation policy
- Comprehensive API documentation

### Audit Logging

**What We Log**
- Authentication events (login, logout, failed attempts)
- Authorization changes (role changes, permission grants)
- Data access (view, create, update, delete)
- Configuration changes (settings, integrations)
- Administrative actions (user management, system config)
- Security events (2FA setup, password changes)

**Log Management**
- Centralized logging infrastructure
- Tamper-proof log storage
- 1-year retention (configurable for compliance)
- Real-time log analysis and alerting
- SIEM integration for advanced analytics

**Audit Reports**
- User activity reports
- Data access reports
- Configuration change reports
- Security event reports
- Compliance reports (SOC 2, GDPR)

### Vulnerability Management

**Scanning and Assessment**
- Weekly automated vulnerability scans
- Monthly dependency vulnerability checks
- Annual penetration testing (third-party)
- Bug bounty program (future)

**Patch Management**
- Critical vulnerabilities: Patched within 7 days
- High vulnerabilities: Patched within 30 days
- Medium/Low: Patched in regular release cycle
- Emergency patches: Expedited change process

**Responsible Disclosure**
- Security issue reporting: security@simplecrm.com
- Acknowledgment within 24 hours
- Regular updates to reporter
- Public disclosure after fix (coordinated)

### Incident Response

**Incident Response Plan**
- Defined incident severity levels (P1-P4)
- On-call rotation for security incidents
- Escalation procedures
- Communication templates

**Response Process**
1. **Detection**: Monitoring alerts, user reports, external notification
2. **Containment**: Isolate affected systems, prevent spread
3. **Investigation**: Root cause analysis, scope determination
4. **Remediation**: Fix vulnerability, restore systems
5. **Recovery**: Verify fix, resume normal operations
6. **Post-Incident**: Review, lessons learned, improvements

**Incident Communication**
- Internal: Security team, affected teams, leadership
- External: Affected customers, regulators (if required)
- Transparency: Incident post-mortems (where appropriate)

### Backup and Disaster Recovery

**Backup Strategy**
- Daily automated backups (incremental)
- Weekly full backups
- Monthly archive backups
- Encrypted backup storage
- Geo-redundant backup locations

**Retention Policy**
- Daily backups: 30 days
- Weekly backups: 90 days
- Monthly backups: 1 year
- Annual backups: 7 years (compliance)

**Disaster Recovery**
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 24 hours
- Multi-region deployment (active-standby)
- Automated failover capability
- Monthly backup restore testing
- Annual disaster recovery drill

## Compliance and Certifications

### SOC 2 Type II

SimpleCRM is SOC 2 Type II certified, demonstrating:
- **Security**: Protection against unauthorized access
- **Availability**: 99.9% uptime commitment
- **Processing Integrity**: Complete, accurate, timely processing
- **Confidentiality**: Protection of confidential information
- **Privacy**: Proper handling of personal information

Annual audits by independent third-party auditors verify our controls are operating effectively.

→ **Learn more**: [SOC 2 Compliance](soc2-compliance.md)

### GDPR Compliance

For European customers, we comply with GDPR requirements:
- Lawful basis for data processing
- Data subject rights (access, rectification, deletion)
- Data portability
- Privacy by design
- Data breach notification (72 hours)
- Data Protection Officer (DPO) appointed

### Industry Standards

We align with recognized security frameworks:
- **NIST Cybersecurity Framework**
- **ISO 27001/27002** (information security management)
- **CIS Controls** (security best practices)
- **OWASP Top 10** (application security)

## Security Training and Awareness

### Employee Training

**Onboarding**
- Security policy review and acknowledgment
- Password and 2FA setup
- Data handling training
- Incident reporting procedures

**Ongoing Training**
- Annual security awareness training (mandatory)
- Phishing simulation exercises (quarterly)
- Role-specific security training
- Security newsletter (monthly)

**Developer Training**
- Secure coding practices
- OWASP Top 10 vulnerabilities
- Secure SDLC processes
- Tools training (SAST, DAST, dependency scanning)

### Security Culture

- Security champions in each team
- Security office hours for questions
- Blameless post-mortems for incidents
- Recognition for security contributions
- Regular security updates in all-hands meetings

## Vendor Security

### Vendor Risk Management

**Vendor Assessment**
- Security questionnaire for all vendors
- SOC 2 report review for critical vendors
- Annual risk reassessment
- Contractual security requirements

**Critical Vendors**
- Cloud infrastructure: AWS/Azure/GCP (SOC 2 certified)
- Authentication: Auth0/Okta (SOC 2 certified)
- Monitoring: Datadog/New Relic (SOC 2 certified)
- Email delivery: SendGrid (SOC 2 certified)
- SMS delivery: Twilio (SOC 2 certified)

### Data Processing Agreements

- DPA with all vendors processing customer data
- GDPR-compliant terms for European data
- Right to audit vendor controls
- Vendor breach notification requirements

## Physical Security

### Cloud Infrastructure

- SOC 2 certified cloud providers (AWS/Azure/GCP)
- Redundant data centers in multiple regions
- 24/7 physical security at data centers
- Biometric access controls
- Video surveillance and monitoring

### Office Security

- Badge-based access control
- Visitor check-in and escort policy
- Security cameras in common areas
- Clean desk policy for sensitive information
- Secure disposal of physical documents (shredding)

### Device Security

- Full-disk encryption required on all devices
- Mobile device management (MDM)
- Remote wipe capability
- Automatic screen lock (5-minute timeout)
- Antivirus/endpoint protection required

## Customer Security Responsibilities

### Shared Responsibility Model

While SimpleCRM provides robust security controls, customers also have security responsibilities:

**SimpleCRM Responsibilities**
- Platform security and availability
- Infrastructure and network security
- Data encryption at rest and in transit
- Patch management and vulnerability remediation
- Audit logging and monitoring

**Customer Responsibilities**
- Strong password selection and protection
- 2FA enrollment and device security
- User access management (onboarding/offboarding)
- Appropriate data classification and sharing
- Awareness of phishing and social engineering

### Security Best Practices for Customers

1. **Enable 2FA**: Require 2FA for all users, especially admins
2. **Review Access Regularly**: Quarterly review of user accounts and permissions
3. **Use Visibility Groups**: Implement principle of least privilege
4. **Monitor Audit Logs**: Review audit logs for suspicious activity
5. **Train Users**: Educate users on security policies and phishing
6. **Report Issues**: Immediately report suspected security incidents
7. **Keep Contact Info Updated**: Ensure security contact is current

## Reporting Security Issues

### Responsible Disclosure

If you discover a security vulnerability:

1. **Email**: security@simplecrm.com (PGP key available)
2. **Do Not**: Publicly disclose until we've had time to fix
3. **Provide**: Detailed description, steps to reproduce, impact
4. **Expect**: Acknowledgment within 24 hours, updates every 72 hours

### Bug Bounty (Future)

We plan to launch a bug bounty program to reward security researchers who help us improve security.

## Security Roadmap

### Current Status (2024)

- ✅ Role-based access control (RBAC)
- ✅ Multi-factor authentication (2FA)
- ✅ Visibility groups
- ✅ Data encryption (at rest and in transit)
- ✅ Audit logging
- ✅ SOC 2 Type II certification

### Near-Term (Next 6 months)

- 🔄 Hardware security key support (WebAuthn/FIDO2)
- 🔄 Advanced threat detection (AI-powered)
- 🔄 Bug bounty program launch
- 🔄 ISO 27001 certification
- 🔄 Enhanced SIEM capabilities

### Long-Term (6-12 months)

- 📋 Biometric authentication (mobile apps)
- 📋 Zero-trust network architecture
- 📋 Customer-managed encryption keys (BYOK)
- 📋 Field-level encryption for sensitive data
- 📋 Advanced DLP (Data Loss Prevention)

## Security Contact

For security-related inquiries:

- **Security Issues**: security@simplecrm.com
- **Privacy Questions**: privacy@simplecrm.com
- **Compliance Requests**: compliance@simplecrm.com
- **General Support**: support@simplecrm.com

## Additional Resources

- [User Roles and Permissions](user-roles-permissions.md)
- [Visibility Groups](visibility-groups.md)
- [Two-Factor Authentication](two-factor-authentication.md)
- [SOC 2 Compliance](soc2-compliance.md)
- [Security Whitepaper](https://simplecrm.com/security-whitepaper) (future)
- [Trust Center](https://trust.simplecrm.com) (future)

---

**Last Updated**: 2025-11-10  
**Document Version**: 1.0  
**Review Schedule**: Quarterly
