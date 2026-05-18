# Two-Way Email Sync - Implementation Guide

## Overview

This guide provides implementation details and code examples for integrating the Two-Way Email Sync feature into SimpleCRM.

## Technology Stack

### Backend
- **Runtime**: Node.js 18+ or Python 3.11+
- **Framework**: Express.js / FastAPI
- **Database**: PostgreSQL 14+ (primary), Redis (cache)
- **Message Queue**: RabbitMQ / AWS SQS
- **Storage**: S3 / Cloud Storage (for attachments)

### Frontend
- **Framework**: React 18+ / Vue 3+
- **State Management**: Redux / Zustand
- **Real-time**: WebSocket / Socket.io
- **Rich Text Editor**: TipTap / Quill

### External Services
- **Gmail API**: Google Cloud Platform
- **Microsoft Graph API**: Azure AD
- **Email Parser**: MailParser (Node.js) / python-email
- **Encryption**: crypto-js / cryptography

## Database Schema

### Email Accounts Table

```sql
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('gmail', 'outlook', 'imap')),
  email_address VARCHAR(255) NOT NULL,
  
  -- OAuth credentials (encrypted)
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP,
  
  -- IMAP/SMTP credentials (encrypted, optional)
  imap_host VARCHAR(255),
  imap_port INTEGER,
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  imap_username VARCHAR(255),
  imap_password TEXT,
  
  -- Sync state
  last_sync_at TIMESTAMP,
  sync_token TEXT, -- For incremental sync
  history_id BIGINT, -- Gmail history ID
  
  -- Webhook subscription
  webhook_id VARCHAR(255),
  webhook_expires_at TIMESTAMP,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'error', 'disconnected')),
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, email_address)
);

CREATE INDEX idx_email_accounts_user_id ON email_accounts(user_id);
CREATE INDEX idx_email_accounts_status ON email_accounts(status);
```

### Emails Table

```sql
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- External identifiers
  external_id VARCHAR(255) NOT NULL, -- Provider's message ID
  thread_id VARCHAR(255),
  
  -- Email headers
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  subject TEXT,
  
  -- Email content
  body_text TEXT,
  body_html TEXT,
  snippet TEXT, -- First 200 chars for preview
  
  -- Metadata
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(20) DEFAULT 'delivered' CHECK (status IN ('draft', 'sent', 'delivered', 'failed')),
  
  sent_at TIMESTAMP NOT NULL,
  received_at TIMESTAMP,
  
  -- Tracking
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMP,
  click_count INTEGER DEFAULT 0,
  
  -- Flags
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- System
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(account_id, external_id)
);

CREATE INDEX idx_emails_account_id ON emails(account_id);
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_emails_direction ON emails(direction);
CREATE INDEX idx_emails_sent_at ON emails(sent_at DESC);
CREATE INDEX idx_emails_is_read ON emails(is_read) WHERE is_read = FALSE;
```

### Email Recipients Table

```sql
CREATE TABLE email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  recipient_type VARCHAR(5) NOT NULL CHECK (recipient_type IN ('to', 'cc', 'bcc')),
  email_address VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_recipients_email_id ON email_recipients(email_id);
CREATE INDEX idx_email_recipients_email_address ON email_recipients(email_address);
```

### Email Attachments Table

```sql
CREATE TABLE email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  
  -- Storage
  storage_path TEXT NOT NULL, -- S3 key or file path
  storage_url TEXT, -- Signed URL for download
  
  -- Provider reference
  external_id VARCHAR(255), -- Provider's attachment ID
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_attachments_email_id ON email_attachments(email_id);
```

### Email Links (CRM Relationships)

```sql
CREATE TABLE email_contacts (
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (email_id, contact_id)
);

CREATE TABLE email_deals (
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (email_id, deal_id)
);

CREATE TABLE email_activities (
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (email_id, activity_id)
);
```

### Email Templates Table

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  
  -- Variables used in template
  variables JSONB DEFAULT '[]',
  
  -- Sharing
  is_shared BOOLEAN DEFAULT FALSE,
  
  -- Stats
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);
```

### Email Tracking Events

```sql
CREATE TABLE email_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('open', 'click')),
  
  -- For click events
  link_url TEXT,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tracking_events_email_id ON email_tracking_events(email_id);
CREATE INDEX idx_tracking_events_type ON email_tracking_events(event_type);
CREATE INDEX idx_tracking_events_created_at ON email_tracking_events(created_at DESC);
```

## Email Provider Integration

### Gmail Integration (Node.js)

```typescript
// src/services/email/providers/gmail.provider.ts

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { EmailProvider, EmailMessage, Email } from '../types';

export class GmailProvider implements EmailProvider {
  private oauth2Client: OAuth2Client;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private redirectUri: string
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async authenticate(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to obtain tokens');
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(accessToken: string, refreshToken: string): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Send an email
   */
  async sendEmail(message: EmailMessage): Promise<{ messageId: string }> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    // Build RFC 2822 formatted email
    const emailLines = [];
    
    emailLines.push(`From: ${message.from.email}`);
    emailLines.push(`To: ${message.to.map(r => r.email).join(', ')}`);
    
    if (message.cc?.length) {
      emailLines.push(`Cc: ${message.cc.map(r => r.email).join(', ')}`);
    }
    
    emailLines.push(`Subject: ${message.subject}`);
    emailLines.push('Content-Type: text/html; charset=utf-8');
    emailLines.push('');
    emailLines.push(message.bodyHtml || message.bodyText || '');

    const email = emailLines.join('\r\n');
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return { messageId: response.data.id! };
  }

  /**
   * Fetch emails with pagination
   */
  async fetchEmails(options: {
    maxResults?: number;
    pageToken?: string;
    query?: string;
  }): Promise<{ emails: Email[]; nextPageToken?: string }> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    // List messages
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: options.maxResults || 50,
      pageToken: options.pageToken,
      q: options.query,
    });

    const messageIds = listResponse.data.messages || [];
    const emails: Email[] = [];

    // Fetch full details for each message
    for (const msgRef of messageIds) {
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: msgRef.id!,
        format: 'full',
      });

      const email = this.parseGmailMessage(message.data);
      emails.push(email);
    }

    return {
      emails,
      nextPageToken: listResponse.data.nextPageToken,
    };
  }

  /**
   * Parse Gmail message to Email object
   */
  private parseGmailMessage(message: any): Email {
    const headers = message.payload.headers;
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

    // Parse body
    let bodyText = '';
    let bodyHtml = '';

    if (message.payload.body?.data) {
      bodyText = Buffer.from(message.payload.body.data, 'base64').toString();
    } else if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          bodyText = Buffer.from(part.body.data, 'base64').toString();
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          bodyHtml = Buffer.from(part.body.data, 'base64').toString();
        }
      }
    }

    return {
      externalId: message.id,
      threadId: message.threadId,
      from: this.parseEmailAddress(getHeader('From')),
      to: this.parseEmailAddresses(getHeader('To')),
      cc: this.parseEmailAddresses(getHeader('Cc')),
      subject: getHeader('Subject'),
      bodyText,
      bodyHtml,
      sentAt: new Date(parseInt(message.internalDate)),
      direction: 'inbound', // Determine based on sender
      snippet: message.snippet,
    };
  }

  /**
   * Setup Gmail push notifications
   */
  async setupWebhook(topicName: string): Promise<{ watchId: string; expiration: Date }> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: `projects/YOUR_PROJECT/topics/${topicName}`,
        labelIds: ['INBOX'],
      },
    });

    return {
      watchId: response.data.historyId!,
      expiration: new Date(parseInt(response.data.expiration!)),
    };
  }

  /**
   * Fetch email history changes
   */
  async fetchHistory(startHistoryId: string): Promise<{ emails: Email[]; historyId: string }> {
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    const response = await gmail.users.history.list({
      userId: 'me',
      startHistoryId,
      historyTypes: ['messageAdded'],
    });

    const emails: Email[] = [];
    const history = response.data.history || [];

    for (const record of history) {
      if (record.messagesAdded) {
        for (const msgAdded of record.messagesAdded) {
          const message = await gmail.users.messages.get({
            userId: 'me',
            id: msgAdded.message!.id!,
            format: 'full',
          });
          emails.push(this.parseGmailMessage(message.data));
        }
      }
    }

    return {
      emails,
      historyId: response.data.historyId!,
    };
  }

  private parseEmailAddress(address: string): { email: string; name: string } {
    if (!address) return { email: '', name: '' };
    
    const match = address.match(/^(.+?)\s*<(.+?)>$/) || address.match(/^(.+)$/);
    
    if (match && match[2]) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    
    return { email: match![1].trim(), name: '' };
  }

  private parseEmailAddresses(addresses: string): Array<{ email: string; name: string }> {
    if (!addresses) return [];
    return addresses.split(',').map(addr => this.parseEmailAddress(addr.trim()));
  }
}
```

### Outlook Integration (Node.js)

```typescript
// src/services/email/providers/outlook.provider.ts

import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import { EmailProvider, EmailMessage, Email } from '../types';

export class OutlookProvider implements EmailProvider {
  private client: Client;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private tenantId: string
  ) {}

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(): string {
    const scopes = ['Mail.Read', 'Mail.Send', 'Mail.ReadWrite', 'offline_access'];
    
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?` +
      `client_id=${this.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${encodeURIComponent(scopes.join(' '))}`;
  }

  /**
   * Initialize Graph client with credentials
   */
  setCredentials(accessToken: string): void {
    const authProvider = {
      getAccessToken: async () => accessToken,
    };

    this.client = Client.initWithMiddleware({
      authProvider,
    });
  }

  /**
   * Send an email via Microsoft Graph
   */
  async sendEmail(message: EmailMessage): Promise<{ messageId: string }> {
    const mail = {
      message: {
        subject: message.subject,
        body: {
          contentType: 'HTML',
          content: message.bodyHtml || message.bodyText,
        },
        toRecipients: message.to.map(r => ({
          emailAddress: {
            address: r.email,
            name: r.name,
          },
        })),
        ccRecipients: message.cc?.map(r => ({
          emailAddress: {
            address: r.email,
            name: r.name,
          },
        })),
      },
      saveToSentItems: true,
    };

    const response = await this.client.api('/me/sendMail').post(mail);
    
    return { messageId: response.id };
  }

  /**
   * Fetch emails from inbox
   */
  async fetchEmails(options: {
    top?: number;
    skip?: number;
    filter?: string;
  }): Promise<{ emails: Email[]; nextLink?: string }> {
    let request = this.client
      .api('/me/messages')
      .top(options.top || 50)
      .skip(options.skip || 0)
      .orderby('receivedDateTime DESC');

    if (options.filter) {
      request = request.filter(options.filter);
    }

    const response = await request.get();
    
    const emails = response.value.map((msg: any) => this.parseOutlookMessage(msg));

    return {
      emails,
      nextLink: response['@odata.nextLink'],
    };
  }

  /**
   * Parse Outlook message to Email object
   */
  private parseOutlookMessage(message: any): Email {
    return {
      externalId: message.id,
      threadId: message.conversationId,
      from: {
        email: message.from.emailAddress.address,
        name: message.from.emailAddress.name,
      },
      to: message.toRecipients.map((r: any) => ({
        email: r.emailAddress.address,
        name: r.emailAddress.name,
      })),
      cc: message.ccRecipients?.map((r: any) => ({
        email: r.emailAddress.address,
        name: r.emailAddress.name,
      })) || [],
      subject: message.subject,
      bodyText: message.body.contentType === 'Text' ? message.body.content : '',
      bodyHtml: message.body.contentType === 'HTML' ? message.body.content : '',
      sentAt: new Date(message.sentDateTime),
      receivedAt: new Date(message.receivedDateTime),
      direction: 'inbound',
      snippet: message.bodyPreview,
    };
  }

  /**
   * Setup Microsoft Graph webhook subscription
   */
  async setupWebhook(callbackUrl: string): Promise<{ subscriptionId: string; expiration: Date }> {
    const subscription = {
      changeType: 'created,updated',
      notificationUrl: callbackUrl,
      resource: '/me/messages',
      expirationDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      clientState: 'secretClientState',
    };

    const response = await this.client.api('/subscriptions').post(subscription);

    return {
      subscriptionId: response.id,
      expiration: new Date(response.expirationDateTime),
    };
  }
}
```

## Email Synchronization Service

```typescript
// src/services/email/sync.service.ts

import { EmailProvider } from './providers/types';
import { EmailRepository } from '../repositories/email.repository';
import { EmailAccountRepository } from '../repositories/email-account.repository';
import { ContactService } from '../contacts/contact.service';
import { ActivityService } from '../activities/activity.service';

export class EmailSyncService {
  constructor(
    private emailRepo: EmailRepository,
    private accountRepo: EmailAccountRepository,
    private contactService: ContactService,
    private activityService: ActivityService
  ) {}

  /**
   * Sync emails for a specific account
   */
  async syncAccount(accountId: string): Promise<{ emailsSynced: number }> {
    const account = await this.accountRepo.findById(accountId);
    if (!account) {
      throw new Error('Email account not found');
    }

    const provider = this.getProvider(account);
    provider.setCredentials(account.accessToken, account.refreshToken);

    let emailsSynced = 0;

    try {
      if (account.historyId) {
        // Incremental sync using history
        const { emails, historyId } = await provider.fetchHistory(account.historyId);
        
        for (const email of emails) {
          await this.processEmail(email, account);
          emailsSynced++;
        }

        await this.accountRepo.update(accountId, { 
          historyId,
          lastSyncAt: new Date(),
          status: 'active',
        });
      } else {
        // Full sync
        let pageToken: string | undefined;
        
        do {
          const { emails, nextPageToken } = await provider.fetchEmails({
            maxResults: 50,
            pageToken,
          });

          for (const email of emails) {
            await this.processEmail(email, account);
            emailsSynced++;
          }

          pageToken = nextPageToken;
        } while (pageToken);

        await this.accountRepo.update(accountId, { 
          lastSyncAt: new Date(),
          status: 'active',
        });
      }

      return { emailsSynced };
    } catch (error) {
      await this.accountRepo.update(accountId, {
        status: 'error',
        errorMessage: error.message,
      });
      throw error;
    }
  }

  /**
   * Process a single email
   */
  private async processEmail(email: any, account: any): Promise<void> {
    // Check if email already exists
    const existing = await this.emailRepo.findByExternalId(
      account.id,
      email.externalId
    );

    if (existing) {
      // Update if needed
      return;
    }

    // Store email in database
    const savedEmail = await this.emailRepo.create({
      accountId: account.id,
      userId: account.userId,
      externalId: email.externalId,
      threadId: email.threadId,
      from: email.from,
      subject: email.subject,
      bodyText: email.bodyText,
      bodyHtml: email.bodyHtml,
      snippet: email.snippet,
      direction: email.direction,
      sentAt: email.sentAt,
      receivedAt: email.receivedAt || email.sentAt,
    });

    // Store recipients
    await this.emailRepo.addRecipients(savedEmail.id, email.to, 'to');
    if (email.cc?.length) {
      await this.emailRepo.addRecipients(savedEmail.id, email.cc, 'cc');
    }

    // Match to contacts
    await this.matchEmailToContacts(savedEmail);

    // Create activity record
    await this.createEmailActivity(savedEmail);
  }

  /**
   * Match email to existing contacts
   */
  private async matchEmailToContacts(email: any): Promise<void> {
    const emailAddresses = [
      email.from.email,
      ...email.to?.map((r: any) => r.email) || [],
      ...email.cc?.map((r: any) => r.email) || [],
    ];

    for (const emailAddress of emailAddresses) {
      const contact = await this.contactService.findByEmail(emailAddress);
      
      if (contact) {
        await this.emailRepo.linkToContact(email.id, contact.id);
      }
    }
  }

  /**
   * Create activity record for email
   */
  private async createEmailActivity(email: any): Promise<void> {
    const activity = await this.activityService.create({
      userId: email.userId,
      type: email.direction === 'outbound' ? 'email_sent' : 'email_received',
      subject: email.subject,
      description: email.snippet,
      activityDate: email.sentAt,
      contactIds: [], // Will be populated by matchEmailToContacts
    });

    await this.emailRepo.linkToActivity(email.id, activity.id);
  }

  private getProvider(account: any): EmailProvider {
    // Return appropriate provider based on account.provider
    // Implementation depends on dependency injection setup
    throw new Error('Not implemented');
  }
}
```

## Email Tracking Implementation

```typescript
// src/services/email/tracking.service.ts

export class EmailTrackingService {
  /**
   * Generate tracking pixel URL
   */
  generateTrackingPixelUrl(emailId: string): string {
    const token = this.generateTrackingToken(emailId);
    return `${process.env.APP_URL}/api/email/track/open/${emailId}/${token}.png`;
  }

  /**
   * Generate tracking link
   */
  generateTrackingLink(emailId: string, originalUrl: string): string {
    const token = this.generateTrackingToken(emailId);
    const encodedUrl = encodeURIComponent(originalUrl);
    return `${process.env.APP_URL}/api/email/track/click/${emailId}/${token}?url=${encodedUrl}`;
  }

  /**
   * Insert tracking pixel into HTML email
   */
  insertTrackingPixel(emailId: string, htmlBody: string): string {
    const pixelUrl = this.generateTrackingPixelUrl(emailId);
    const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" />`;
    
    // Insert before closing body tag
    return htmlBody.replace(/<\/body>/i, `${pixel}</body>`);
  }

  /**
   * Replace links with tracking links
   */
  replaceLinksWithTracking(emailId: string, htmlBody: string): string {
    const linkRegex = /<a\s+([^>]*\s+)?href="([^"]+)"([^>]*)>/gi;
    
    return htmlBody.replace(linkRegex, (match, before, url, after) => {
      const trackingUrl = this.generateTrackingLink(emailId, url);
      return `<a ${before || ''}href="${trackingUrl}"${after || ''}>`;
    });
  }

  /**
   * Record email open event
   */
  async recordOpen(emailId: string, metadata: { ipAddress?: string; userAgent?: string }): Promise<void> {
    // Update email record
    await this.emailRepo.update(emailId, {
      opened: true,
      openedAt: new Date(),
    });

    // Create tracking event
    await this.trackingEventRepo.create({
      emailId,
      eventType: 'open',
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });
  }

  /**
   * Record link click event
   */
  async recordClick(emailId: string, linkUrl: string, metadata: { ipAddress?: string; userAgent?: string }): Promise<void> {
    // Update click count
    await this.emailRepo.incrementClickCount(emailId);

    // Create tracking event
    await this.trackingEventRepo.create({
      emailId,
      eventType: 'click',
      linkUrl,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    });
  }

  private generateTrackingToken(emailId: string): string {
    // Generate secure token for tracking
    const crypto = require('crypto');
    const secret = process.env.TRACKING_SECRET || 'change-me';
    return crypto
      .createHmac('sha256', secret)
      .update(emailId)
      .digest('hex')
      .substring(0, 16);
  }
}
```

## Background Jobs

```typescript
// src/jobs/email-sync.job.ts

import { CronJob } from 'cron';
import { EmailSyncService } from '../services/email/sync.service';
import { EmailAccountRepository } from '../repositories/email-account.repository';

export class EmailSyncJob {
  constructor(
    private syncService: EmailSyncService,
    private accountRepo: EmailAccountRepository
  ) {}

  /**
   * Start periodic email sync job
   */
  start(): void {
    // Run every 10 minutes
    const job = new CronJob('*/10 * * * *', async () => {
      await this.syncAllAccounts();
    });

    job.start();
  }

  /**
   * Sync all active email accounts
   */
  private async syncAllAccounts(): Promise<void> {
    const accounts = await this.accountRepo.findAllActive();

    for (const account of accounts) {
      try {
        await this.syncService.syncAccount(account.id);
        console.log(`Synced account ${account.emailAddress}`);
      } catch (error) {
        console.error(`Failed to sync account ${account.emailAddress}:`, error);
      }
    }
  }
}
```

## Security Best Practices

### Token Encryption

```typescript
// src/utils/encryption.ts

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

## Testing Examples

```typescript
// tests/email-sync.test.ts

describe('EmailSyncService', () => {
  let syncService: EmailSyncService;
  let mockProvider: jest.Mocked<EmailProvider>;

  beforeEach(() => {
    // Setup mocks
  });

  describe('syncAccount', () => {
    it('should sync new emails successfully', async () => {
      const mockEmails = [
        {
          externalId: 'msg_123',
          subject: 'Test Email',
          from: { email: 'sender@example.com', name: 'Sender' },
          sentAt: new Date(),
        },
      ];

      mockProvider.fetchEmails.mockResolvedValue({
        emails: mockEmails,
        nextPageToken: undefined,
      });

      const result = await syncService.syncAccount('acc_123');

      expect(result.emailsSynced).toBe(1);
      expect(mockProvider.fetchEmails).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      mockProvider.fetchEmails.mockRejectedValue(new Error('API Error'));

      await expect(syncService.syncAccount('acc_123')).rejects.toThrow('API Error');
    });
  });
});
```

## Deployment Checklist

- [ ] Set up OAuth credentials with Google/Microsoft
- [ ] Configure encryption keys for token storage
- [ ] Set up message queue (RabbitMQ/SQS)
- [ ] Configure Redis for caching
- [ ] Set up S3/Cloud Storage for attachments
- [ ] Configure webhook endpoints and SSL certificates
- [ ] Set up background job workers
- [ ] Configure monitoring and alerting
- [ ] Test OAuth flow end-to-end
- [ ] Test webhook delivery
- [ ] Load test email sync performance
- [ ] Document API for frontend team
- [ ] Create user documentation
- [ ] Train support team on email features

## Configuration

```env
# OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://app.simplecrm.com/email/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=your-tenant-id

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-key
TRACKING_SECRET=your-tracking-secret

# Storage
S3_BUCKET=email-attachments
S3_REGION=us-east-1

# Message Queue
RABBITMQ_URL=amqp://localhost:5672

# Redis
REDIS_URL=redis://localhost:6379

# App
APP_URL=https://app.simplecrm.com
```

## Next Steps

1. Implement the database schema
2. Build email provider integrations (Gmail, Outlook)
3. Create email sync service
4. Build API endpoints
5. Implement background jobs
6. Add email tracking
7. Create frontend components
8. Write tests
9. Deploy to staging
10. User acceptance testing
11. Production deployment
