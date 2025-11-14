# Two-Way Email Sync - Architecture Design

## Overview

This document describes the architecture for implementing two-way email synchronization in SimpleCRM, enabling users to send, receive, and log emails directly within the CRM system.

## System Components

### 1. Email Provider Integration Layer

#### Supported Providers
- **Google Gmail** (OAuth 2.0 + Gmail API)
- **Microsoft Outlook/Office 365** (OAuth 2.0 + Microsoft Graph API)
- **IMAP/SMTP** (Generic email servers)

#### Provider Abstraction
```typescript
interface EmailProvider {
  authenticate(credentials: OAuthCredentials): Promise<AuthToken>;
  sendEmail(message: EmailMessage): Promise<EmailResult>;
  fetchEmails(filter: EmailFilter): Promise<Email[]>;
  setupWebhook(callbackUrl: string): Promise<WebhookConfig>;
  syncContacts(): Promise<Contact[]>;
}
```

### 2. Authentication & Authorization

#### OAuth Flow
1. User initiates email account connection
2. Redirect to provider's OAuth consent screen
3. User grants permissions (read/send email, contacts)
4. Receive authorization code
5. Exchange for access token and refresh token
6. Store encrypted tokens in database

#### Required Scopes
- **Gmail**: `gmail.readonly`, `gmail.send`, `gmail.modify`
- **Outlook**: `Mail.Read`, `Mail.Send`, `Mail.ReadWrite`, `Contacts.Read`

#### Token Management
- Store tokens encrypted at rest (AES-256)
- Automatic token refresh before expiry
- Revocation handling and re-authentication prompts

### 3. Email Synchronization Engine

#### Sync Strategies

**Strategy 1: Webhook-Based (Real-time)**
- Gmail: Push notifications via Cloud Pub/Sub
- Outlook: Microsoft Graph webhooks
- Immediate notification of new emails
- Low latency, efficient resource usage

**Strategy 2: Polling-Based (Fallback)**
- Check for new emails at regular intervals (5-15 minutes)
- Used for IMAP or when webhooks unavailable
- Configurable polling frequency per user

#### Sync Process Flow
```
1. Receive webhook notification OR polling trigger
2. Fetch new/modified emails from provider
3. Parse email content (text, HTML, attachments)
4. Extract metadata (sender, recipients, subject, date)
5. Match email participants to CRM contacts/leads
6. Store email in database
7. Link email to related deals/activities
8. Update UI in real-time via WebSocket
9. Send notifications to relevant users
```

### 4. Email Storage Data Model

```typescript
interface Email {
  id: string;
  externalId: string;              // Provider's message ID
  threadId: string;                // Conversation thread
  userId: string;                  // CRM user who owns this email account
  provider: 'gmail' | 'outlook' | 'imap';
  
  // Email Content
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  subject: string;
  bodyText: string;
  bodyHtml: string;
  
  // Metadata
  sentAt: Date;
  receivedAt: Date;
  direction: 'inbound' | 'outbound';
  status: 'draft' | 'sent' | 'delivered' | 'failed';
  
  // Attachments
  attachments: Attachment[];
  
  // CRM Relationships
  contactIds: string[];            // Linked contacts
  leadIds: string[];               // Linked leads
  dealIds: string[];               // Linked deals
  activityId: string;              // Associated activity record
  
  // Tracking
  opened: boolean;
  openedAt: Date;
  clickedLinks: string[];
  
  // System
  createdAt: Date;
  updatedAt: Date;
  syncedAt: Date;
}

interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;                     // Signed URL for download
  externalId: string;              // Provider's attachment ID
}

interface EmailAddress {
  email: string;
  name: string;
}
```

### 5. Email Sending Service

#### Send Email Flow
```
1. User composes email in CRM
2. Validate recipients and content
3. Apply email template (if selected)
4. Insert tracking pixels (if enabled)
5. Convert tracking links
6. Send via user's connected email account
7. Store sent email in database
8. Link to contact/deal/activity
9. Update activity timeline
```

#### Email Templates
- Pre-defined templates for common scenarios
- Variable substitution (contact name, company, deal value)
- Rich text editor with formatting
- Template versioning and A/B testing

#### Email Tracking
- **Open tracking**: 1x1 transparent pixel
- **Link tracking**: Redirect through tracking URL
- **Engagement scoring**: Track opens, clicks, replies
- **Privacy compliance**: Allow users to disable tracking

### 6. Email Composition UI

#### Features
- Rich text editor (formatting, images, links)
- Template selection dropdown
- Contact/lead auto-suggestion
- Deal/activity linking
- Attachment upload (drag & drop)
- CC/BCC fields
- Schedule send
- Save as draft

### 7. Email Thread Management

#### Thread Grouping
- Group emails by conversation thread
- Display in chronological order
- Show all participants
- Highlight unread messages
- Collapse/expand thread view

#### Smart Matching
- Automatically link emails to existing contacts
- Suggest creating new contacts for unknown senders
- Match email domain to company records
- Link to relevant deals based on subject/content

### 8. Activity Logging

#### Automatic Activity Creation
- Create activity record for each email
- Type: "Email Sent" or "Email Received"
- Link to contact, lead, deal
- Show in activity timeline
- Include email content and metadata

#### Activity Timeline
- Unified view of all interactions
- Emails, calls, meetings, notes
- Chronological order
- Filter by type, date, participant

## Integration Architecture

### API Endpoints

```
POST   /api/email/connect              # Initiate OAuth flow
GET    /api/email/callback             # OAuth callback handler
POST   /api/email/send                 # Send email
GET    /api/email/inbox                # Fetch inbox emails
GET    /api/email/threads/:id          # Get email thread
POST   /api/email/sync                 # Manual sync trigger
DELETE /api/email/disconnect           # Disconnect email account
GET    /api/email/status               # Get sync status
POST   /api/email/webhooks/:provider   # Webhook receiver
```

### Background Jobs

```typescript
Jobs:
  - EmailSyncJob: Poll for new emails (every 5-15 min)
  - TokenRefreshJob: Refresh expiring tokens (daily)
  - EmailTrackingJob: Process tracking events (real-time)
  - EmailCleanupJob: Archive old emails (monthly)
  - WebhookRenewalJob: Renew webhook subscriptions (weekly)
```

## Security Considerations

### Data Protection
- Encrypt OAuth tokens at rest (AES-256)
- Encrypt sensitive email content
- Use HTTPS for all API communications
- Implement rate limiting on API endpoints
- Validate webhook signatures

### Privacy & Compliance
- GDPR compliance for EU users
- CAN-SPAM compliance for email tracking
- Allow users to opt-out of tracking
- Data retention policies
- Right to be forgotten (delete email data)

### Access Control
- Role-based access (Admin, Manager, Rep)
- User can only access their own email accounts
- Share emails with team (optional)
- Audit log of email access

## Performance Considerations

### Scalability
- Use message queues for async processing (RabbitMQ/SQS)
- Cache frequently accessed emails (Redis)
- Paginate email lists (50-100 per page)
- Lazy load email bodies and attachments
- Database indexing on email fields

### Optimization
- Batch email fetching (reduce API calls)
- Incremental sync (only new/modified)
- Compress attachments
- CDN for attachment delivery
- WebSocket for real-time updates

## Monitoring & Observability

### Metrics
- Email sync success/failure rate
- Sync latency (time from send to CRM)
- API rate limit usage
- Token refresh failures
- Email delivery rate

### Alerts
- Webhook subscription failures
- Token expiration without refresh
- High sync error rate
- API quota exhaustion
- Attachment storage capacity

### Logging
- All email operations (send, receive, sync)
- OAuth authentication events
- API errors and rate limits
- Webhook delivery status
- User actions (compose, send, view)

## Deployment Strategy

### Phase 1: MVP (Month 1)
- Gmail OAuth integration
- Basic send/receive functionality
- Email storage and display
- Manual sync trigger

### Phase 2: Enhanced Features (Month 2)
- Outlook integration
- Webhook-based real-time sync
- Email templates
- Basic tracking (opens)

### Phase 3: Advanced Features (Month 3)
- IMAP/SMTP support
- Advanced tracking (links, engagement)
- Email threading
- Smart contact matching
- Scheduled sending

## Testing Strategy

### Unit Tests
- Provider API integration
- Email parsing and validation
- Token refresh logic
- Webhook signature verification

### Integration Tests
- OAuth flow end-to-end
- Email send/receive cycle
- Webhook delivery
- Database operations

### End-to-End Tests
- User connects email account
- Send email from CRM
- Receive and display email
- Link email to contact/deal

## Documentation Requirements

### User Documentation
- How to connect email accounts
- Sending emails from CRM
- Understanding email tracking
- Email templates usage
- Privacy and data handling

### Developer Documentation
- API reference
- Provider integration guide
- Webhook setup
- Database schema
- Configuration options

## Success Metrics

### Adoption
- % of users who connect email accounts
- Average emails sent per user per day
- % of deals with linked email communication

### Performance
- Email sync latency < 60 seconds
- 99.9% uptime for email service
- < 1% email send failure rate

### Engagement
- Email open rate tracking accuracy
- User satisfaction score > 4.5/5
- Reduction in manual email logging by 90%
