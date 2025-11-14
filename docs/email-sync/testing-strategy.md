# Two-Way Email Sync - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the Two-Way Email Sync feature, including unit tests, integration tests, end-to-end tests, and acceptance criteria.

## Testing Pyramid

```
                    E2E Tests (5%)
                 ==================
              Integration Tests (15%)
           ===========================
         Unit Tests (80%)
    ===================================
```

## Unit Tests

### Email Provider Integration

#### Gmail Provider Tests

```typescript
describe('GmailProvider', () => {
  describe('authenticate', () => {
    it('should exchange auth code for tokens', async () => {
      const provider = new GmailProvider(config);
      const result = await provider.authenticate('auth-code-123');
      
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error on invalid auth code', async () => {
      const provider = new GmailProvider(config);
      
      await expect(
        provider.authenticate('invalid-code')
      ).rejects.toThrow('Failed to obtain tokens');
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const provider = new GmailProvider(config);
      provider.setCredentials('access-token', 'refresh-token');
      
      const result = await provider.sendEmail({
        from: { email: 'sender@example.com', name: 'Sender' },
        to: [{ email: 'recipient@example.com', name: 'Recipient' }],
        subject: 'Test Email',
        bodyText: 'This is a test',
      });

      expect(result.messageId).toBeDefined();
    });

    it('should handle attachment encoding', async () => {
      const provider = new GmailProvider(config);
      const message = {
        from: { email: 'sender@example.com', name: 'Sender' },
        to: [{ email: 'recipient@example.com', name: 'Recipient' }],
        subject: 'Test with Attachment',
        bodyText: 'See attached',
        attachments: [{
          fileName: 'test.pdf',
          contentType: 'application/pdf',
          base64Content: 'JVBERi0xLjQK...',
        }],
      };

      const result = await provider.sendEmail(message);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('fetchEmails', () => {
    it('should fetch emails with pagination', async () => {
      const provider = new GmailProvider(config);
      provider.setCredentials('access-token', 'refresh-token');

      const result = await provider.fetchEmails({
        maxResults: 10,
      });

      expect(result.emails).toHaveLength(10);
      expect(result.nextPageToken).toBeDefined();
    });

    it('should parse email headers correctly', async () => {
      const provider = new GmailProvider(config);
      const emails = await provider.fetchEmails({ maxResults: 1 });
      const email = emails.emails[0];

      expect(email.from).toHaveProperty('email');
      expect(email.from).toHaveProperty('name');
      expect(email.subject).toBeDefined();
      expect(email.sentAt).toBeInstanceOf(Date);
    });
  });

  describe('setupWebhook', () => {
    it('should create Gmail push notification', async () => {
      const provider = new GmailProvider(config);
      
      const result = await provider.setupWebhook('crm-notifications');

      expect(result.watchId).toBeDefined();
      expect(result.expiration).toBeInstanceOf(Date);
    });
  });
});
```

#### Outlook Provider Tests

```typescript
describe('OutlookProvider', () => {
  describe('sendEmail', () => {
    it('should send email via Microsoft Graph', async () => {
      const provider = new OutlookProvider(config);
      provider.setCredentials('access-token');

      const result = await provider.sendEmail({
        from: { email: 'sender@example.com', name: 'Sender' },
        to: [{ email: 'recipient@example.com', name: 'Recipient' }],
        subject: 'Test Email',
        bodyHtml: '<p>This is a test</p>',
      });

      expect(result.messageId).toBeDefined();
    });
  });

  describe('fetchEmails', () => {
    it('should fetch emails with OData filters', async () => {
      const provider = new OutlookProvider(config);
      
      const result = await provider.fetchEmails({
        top: 50,
        filter: "receivedDateTime ge 2025-11-01T00:00:00Z",
      });

      expect(result.emails).toBeDefined();
      expect(result.emails.length).toBeLessThanOrEqual(50);
    });
  });
});
```

### Email Sync Service Tests

```typescript
describe('EmailSyncService', () => {
  describe('syncAccount', () => {
    it('should sync new emails successfully', async () => {
      const mockEmails = [
        createMockEmail({ subject: 'Test 1' }),
        createMockEmail({ subject: 'Test 2' }),
      ];

      mockProvider.fetchEmails.mockResolvedValue({
        emails: mockEmails,
      });

      const result = await syncService.syncAccount('account-123');

      expect(result.emailsSynced).toBe(2);
      expect(emailRepo.create).toHaveBeenCalledTimes(2);
    });

    it('should skip existing emails', async () => {
      const email = createMockEmail();
      emailRepo.findByExternalId.mockResolvedValue(email);

      mockProvider.fetchEmails.mockResolvedValue({
        emails: [email],
      });

      const result = await syncService.syncAccount('account-123');

      expect(result.emailsSynced).toBe(0);
      expect(emailRepo.create).not.toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      mockProvider.fetchEmails.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      await expect(
        syncService.syncAccount('account-123')
      ).rejects.toThrow('API rate limit exceeded');

      const account = await accountRepo.findById('account-123');
      expect(account.status).toBe('error');
    });

    it('should use incremental sync when history ID exists', async () => {
      const account = createMockAccount({ historyId: '12345' });
      accountRepo.findById.mockResolvedValue(account);

      mockProvider.fetchHistory.mockResolvedValue({
        emails: [createMockEmail()],
        historyId: '12346',
      });

      await syncService.syncAccount('account-123');

      expect(mockProvider.fetchHistory).toHaveBeenCalledWith('12345');
      expect(accountRepo.update).toHaveBeenCalledWith(
        'account-123',
        expect.objectContaining({ historyId: '12346' })
      );
    });
  });

  describe('matchEmailToContacts', () => {
    it('should link email to existing contacts', async () => {
      const contact = createMockContact({ email: 'john@example.com' });
      contactService.findByEmail.mockResolvedValue(contact);

      const email = createMockEmail({
        from: { email: 'john@example.com', name: 'John' },
      });

      await syncService['matchEmailToContacts'](email);

      expect(emailRepo.linkToContact).toHaveBeenCalledWith(
        email.id,
        contact.id
      );
    });

    it('should handle emails with no matching contacts', async () => {
      contactService.findByEmail.mockResolvedValue(null);

      const email = createMockEmail({
        from: { email: 'unknown@example.com', name: 'Unknown' },
      });

      await syncService['matchEmailToContacts'](email);

      expect(emailRepo.linkToContact).not.toHaveBeenCalled();
    });
  });
});
```

### Email Tracking Tests

```typescript
describe('EmailTrackingService', () => {
  describe('generateTrackingPixelUrl', () => {
    it('should generate valid tracking URL', () => {
      const url = trackingService.generateTrackingPixelUrl('email-123');

      expect(url).toMatch(/\/api\/email\/track\/open\/email-123\/[a-f0-9]+\.png$/);
    });

    it('should generate unique tokens for different emails', () => {
      const url1 = trackingService.generateTrackingPixelUrl('email-1');
      const url2 = trackingService.generateTrackingPixelUrl('email-2');

      expect(url1).not.toBe(url2);
    });
  });

  describe('insertTrackingPixel', () => {
    it('should insert pixel before closing body tag', () => {
      const html = '<html><body><p>Test</p></body></html>';
      const result = trackingService.insertTrackingPixel('email-123', html);

      expect(result).toContain('<img src=');
      expect(result).toMatch(/<img.*<\/body>/);
    });

    it('should handle HTML without body tag', () => {
      const html = '<p>Test</p>';
      const result = trackingService.insertTrackingPixel('email-123', html);

      expect(result).toBe(html); // No change if no body tag
    });
  });

  describe('replaceLinksWithTracking', () => {
    it('should replace all links with tracking links', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = trackingService.replaceLinksWithTracking('email-123', html);

      expect(result).toContain('/api/email/track/click/');
      expect(result).toContain('url=https%3A%2F%2Fexample.com');
    });

    it('should preserve link text and attributes', () => {
      const html = '<a href="https://example.com" class="btn">Click</a>';
      const result = trackingService.replaceLinksWithTracking('email-123', html);

      expect(result).toContain('class="btn"');
      expect(result).toContain('>Click</a>');
    });
  });

  describe('recordOpen', () => {
    it('should update email and create tracking event', async () => {
      await trackingService.recordOpen('email-123', {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
      });

      expect(emailRepo.update).toHaveBeenCalledWith('email-123', {
        opened: true,
        openedAt: expect.any(Date),
      });

      expect(trackingEventRepo.create).toHaveBeenCalledWith({
        emailId: 'email-123',
        eventType: 'open',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
      });
    });
  });
});
```

### Encryption Tests

```typescript
describe('Encryption', () => {
  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt text', () => {
      const plaintext = 'my-secret-token';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext each time', () => {
      const plaintext = 'my-secret-token';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = 'token@#$%^&*()[]{}|\\:";\'<>?,./`~+=';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });
});
```

## Integration Tests

### OAuth Flow Integration

```typescript
describe('OAuth Integration', () => {
  it('should complete Gmail OAuth flow', async () => {
    // 1. Get auth URL
    const authUrlResponse = await request(app)
      .post('/api/email/connect')
      .send({ provider: 'gmail' })
      .expect(200);

    expect(authUrlResponse.body.authUrl).toContain('accounts.google.com');
    const state = authUrlResponse.body.state;

    // 2. Simulate OAuth callback (with mock auth code)
    const callbackResponse = await request(app)
      .get('/api/email/callback')
      .query({
        code: 'mock-auth-code',
        state: state,
        provider: 'gmail',
      })
      .expect(200);

    expect(callbackResponse.body.success).toBe(true);
    expect(callbackResponse.body.accountId).toBeDefined();

    // 3. Verify account is stored
    const account = await emailAccountRepo.findById(
      callbackResponse.body.accountId
    );
    expect(account.provider).toBe('gmail');
    expect(account.status).toBe('active');
  });
});
```

### Email Send/Receive Flow

```typescript
describe('Email Send/Receive', () => {
  it('should send email and sync it back', async () => {
    // 1. Send email via API
    const sendResponse = await request(app)
      .post('/api/email/send')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        accountId: 'account-123',
        to: [{ email: 'recipient@example.com', name: 'Recipient' }],
        subject: 'Test Email',
        bodyText: 'This is a test',
      })
      .expect(200);

    expect(sendResponse.body.emailId).toBeDefined();
    const emailId = sendResponse.body.emailId;

    // 2. Verify email is stored
    const email = await emailRepo.findById(emailId);
    expect(email.subject).toBe('Test Email');
    expect(email.direction).toBe('outbound');
    expect(email.status).toBe('sent');

    // 3. Trigger sync
    await request(app)
      .post('/api/email/sync')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ accountId: 'account-123' })
      .expect(202);

    // 4. Wait for sync to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Verify email still exists with sent status
    const syncedEmail = await emailRepo.findById(emailId);
    expect(syncedEmail.status).toBe('sent');
  });
});
```

### Webhook Integration

```typescript
describe('Gmail Webhook', () => {
  it('should process Gmail push notification', async () => {
    const payload = {
      message: {
        data: Buffer.from(JSON.stringify({
          emailAddress: 'user@example.com',
          historyId: '12345',
        })).toString('base64'),
        messageId: 'msg-id',
        publishTime: new Date().toISOString(),
      },
    };

    await request(app)
      .post('/api/email/webhooks/gmail')
      .set('X-Goog-Channel-ID', 'channel-123')
      .set('X-Goog-Resource-State', 'update')
      .send(payload)
      .expect(200);

    // Verify sync was triggered
    // (Would check background job queue in real implementation)
  });
});

describe('Outlook Webhook', () => {
  it('should process Microsoft Graph notification', async () => {
    const payload = {
      value: [{
        subscriptionId: 'sub-123',
        clientState: 'secret-state',
        changeType: 'created',
        resource: 'Users/user@example.com/Messages/msg-abc',
        subscriptionExpirationDateTime: new Date(Date.now() + 86400000).toISOString(),
        resourceData: {
          id: 'msg-abc',
        },
      }],
    };

    await request(app)
      .post('/api/email/webhooks/outlook')
      .send(payload)
      .expect(200);

    // Verify sync was triggered
  });
});
```

### Email Tracking Integration

```typescript
describe('Email Tracking', () => {
  it('should track email open via pixel', async () => {
    // Create tracked email
    const email = await emailRepo.create({
      accountId: 'account-123',
      userId: 'user-123',
      externalId: 'msg-ext-123',
      subject: 'Test',
      direction: 'outbound',
    });

    const token = generateTrackingToken(email.id);

    // Request tracking pixel
    await request(app)
      .get(`/api/email/track/open/${email.id}/${token}.png`)
      .expect(200)
      .expect('Content-Type', /image\/png/);

    // Verify open was recorded
    const updatedEmail = await emailRepo.findById(email.id);
    expect(updatedEmail.opened).toBe(true);
    expect(updatedEmail.openedAt).toBeDefined();
  });

  it('should track link click and redirect', async () => {
    const email = await emailRepo.create({
      accountId: 'account-123',
      userId: 'user-123',
      externalId: 'msg-ext-123',
      subject: 'Test',
      direction: 'outbound',
    });

    const token = generateTrackingToken(email.id);
    const originalUrl = 'https://example.com/pricing';

    // Click tracking link
    const response = await request(app)
      .get(`/api/email/track/click/${email.id}/${token}`)
      .query({ url: originalUrl })
      .expect(302);

    expect(response.headers.location).toBe(originalUrl);

    // Verify click was recorded
    const events = await trackingEventRepo.findByEmailId(email.id);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('click');
    expect(events[0].linkUrl).toBe(originalUrl);
  });
});
```

## End-to-End Tests

### User Journey: Connect Email and Send

```typescript
describe('E2E: Connect Email and Send', () => {
  it('should complete full email workflow', async () => {
    // 1. User logs in
    const loginPage = await browser.newPage();
    await loginPage.goto('https://app.simplecrm.test/login');
    await loginPage.type('#email', 'user@example.com');
    await loginPage.type('#password', 'password123');
    await loginPage.click('button[type="submit"]');
    await loginPage.waitForNavigation();

    // 2. Navigate to email settings
    await loginPage.goto('https://app.simplecrm.test/settings/email');
    await loginPage.waitForSelector('.email-accounts');

    // 3. Click connect email
    await loginPage.click('button.connect-email');
    
    // 4. Select Gmail
    await loginPage.click('[data-provider="gmail"]');

    // 5. Mock OAuth flow (in test environment)
    // In real E2E, would actually go through OAuth
    await loginPage.waitForSelector('.account-connected');

    // 6. Navigate to contacts
    await loginPage.goto('https://app.simplecrm.test/contacts/contact-123');

    // 7. Click send email
    await loginPage.click('button.send-email');
    await loginPage.waitForSelector('.email-composer');

    // 8. Compose email
    await loginPage.type('#email-subject', 'Test Email');
    await loginPage.type('.email-body', 'This is a test email');

    // 9. Send email
    await loginPage.click('button.send');
    await loginPage.waitForSelector('.email-sent-confirmation');

    // 10. Verify email appears in sent items
    await loginPage.goto('https://app.simplecrm.test/emails');
    await loginPage.waitForSelector('.email-list');
    
    const emailSubject = await loginPage.$eval(
      '.email-list .email-item:first-child .subject',
      el => el.textContent
    );
    expect(emailSubject).toBe('Test Email');
  });
});
```

### User Journey: Receive and Link Email

```typescript
describe('E2E: Receive and Link Email', () => {
  it('should receive email and link to contact', async () => {
    // 1. Trigger external email to be sent (test helper)
    await sendTestEmail({
      from: 'external@example.com',
      to: 'user@example.com',
      subject: 'External Email Test',
    });

    // 2. Login and navigate to emails
    const page = await browser.newPage();
    await page.goto('https://app.simplecrm.test/login');
    // ... login steps ...
    await page.goto('https://app.simplecrm.test/emails');

    // 3. Wait for sync (polling or WebSocket in real app)
    await page.waitForTimeout(30000); // 30 seconds

    // 4. Refresh and find new email
    await page.reload();
    await page.waitForSelector('.email-list');
    
    const newEmail = await page.$eval(
      '.email-list .email-item[data-subject="External Email Test"]',
      el => el
    );
    expect(newEmail).toBeDefined();

    // 5. Open email
    await page.click('.email-list .email-item[data-subject="External Email Test"]');
    await page.waitForSelector('.email-detail');

    // 6. Click link to contact
    await page.click('button.link-to-contact');
    await page.waitForSelector('.contact-search');

    // 7. Search for contact
    await page.type('.contact-search input', 'external@example.com');
    await page.waitForSelector('.search-results .contact-item');

    // 8. Select contact
    await page.click('.search-results .contact-item:first-child');
    await page.waitForSelector('.link-success');

    // 9. Verify link on contact page
    await page.goto('https://app.simplecrm.test/contacts/contact-456');
    await page.waitForSelector('.activity-timeline');
    
    const activities = await page.$$('.activity-timeline .activity-item');
    expect(activities.length).toBeGreaterThan(0);
  });
});
```

## Performance Tests

### Load Testing

```typescript
describe('Performance: Email Sync', () => {
  it('should handle 1000 emails sync in under 5 minutes', async () => {
    const startTime = Date.now();
    
    // Mock provider with 1000 emails
    const mockEmails = Array.from({ length: 1000 }, (_, i) => 
      createMockEmail({ subject: `Email ${i}` })
    );
    
    mockProvider.fetchEmails.mockResolvedValue({
      emails: mockEmails,
    });

    await syncService.syncAccount('account-123');

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5 * 60 * 1000); // 5 minutes
  });

  it('should handle concurrent syncs for 10 accounts', async () => {
    const accounts = Array.from({ length: 10 }, (_, i) => 
      `account-${i}`
    );

    const startTime = Date.now();
    
    await Promise.all(
      accounts.map(accountId => syncService.syncAccount(accountId))
    );

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(60 * 1000); // 1 minute
  });
});

describe('Performance: Email Tracking', () => {
  it('should handle 100 concurrent tracking pixel requests', async () => {
    const requests = Array.from({ length: 100 }, () => 
      request(app).get('/api/email/track/open/email-123/token.png')
    );

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;

    expect(responses.every(r => r.status === 200)).toBe(true);
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
});
```

## Acceptance Criteria Tests

### AC1: Sync Email Accounts

```typescript
describe('AC1: Sync email accounts (Google, Outlook, etc.)', () => {
  it('should connect Gmail account via OAuth', async () => {
    const result = await emailService.connectAccount({
      userId: 'user-123',
      provider: 'gmail',
      authCode: 'mock-auth-code',
    });

    expect(result.account).toBeDefined();
    expect(result.account.provider).toBe('gmail');
    expect(result.account.status).toBe('active');
  });

  it('should connect Outlook account via OAuth', async () => {
    const result = await emailService.connectAccount({
      userId: 'user-123',
      provider: 'outlook',
      authCode: 'mock-auth-code',
    });

    expect(result.account).toBeDefined();
    expect(result.account.provider).toBe('outlook');
    expect(result.account.status).toBe('active');
  });

  it('should sync emails bidirectionally', async () => {
    // Send email
    const sent = await emailService.sendEmail({
      accountId: 'account-123',
      to: [{ email: 'test@example.com', name: 'Test' }],
      subject: 'Test',
      bodyText: 'Test',
    });

    // Sync should pull the sent email back
    await syncService.syncAccount('account-123');

    const emails = await emailRepo.findByAccount('account-123');
    const sentEmail = emails.find(e => e.externalId === sent.messageId);
    
    expect(sentEmail).toBeDefined();
    expect(sentEmail.direction).toBe('outbound');
  });
});
```

### AC2: Send Emails from CRM

```typescript
describe('AC2: Allow users to send emails directly from CRM', () => {
  it('should send email to contact', async () => {
    const result = await emailService.sendEmail({
      accountId: 'account-123',
      to: [{ email: 'contact@example.com', name: 'Contact' }],
      subject: 'Hello from CRM',
      bodyText: 'This email was sent from SimpleCRM',
    });

    expect(result.success).toBe(true);
    expect(result.emailId).toBeDefined();
    expect(result.status).toBe('sent');
  });

  it('should support HTML email with formatting', async () => {
    const result = await emailService.sendEmail({
      accountId: 'account-123',
      to: [{ email: 'contact@example.com', name: 'Contact' }],
      subject: 'Formatted Email',
      bodyHtml: '<h1>Hello</h1><p>This is <strong>formatted</strong>.</p>',
    });

    expect(result.success).toBe(true);
  });

  it('should support attachments', async () => {
    const result = await emailService.sendEmail({
      accountId: 'account-123',
      to: [{ email: 'contact@example.com', name: 'Contact' }],
      subject: 'Email with Attachment',
      bodyText: 'See attached file',
      attachments: [{
        fileName: 'document.pdf',
        contentType: 'application/pdf',
        base64Content: 'JVBERi0xLjQK...',
      }],
    });

    expect(result.success).toBe(true);
  });

  it('should use email templates', async () => {
    const template = await templateRepo.findById('template-123');
    
    const result = await emailService.sendEmail({
      accountId: 'account-123',
      to: [{ email: 'contact@example.com', name: 'John' }],
      templateId: 'template-123',
      templateVariables: {
        firstName: 'John',
        company: 'Acme Corp',
      },
    });

    expect(result.success).toBe(true);
    
    const email = await emailRepo.findById(result.emailId);
    expect(email.subject).toContain('Acme Corp');
    expect(email.bodyText).toContain('John');
  });
});
```

### AC3: Log Sent and Received Emails

```typescript
describe('AC3: Log sent and received emails in the system', () => {
  it('should store sent email in database', async () => {
    const result = await emailService.sendEmail({
      accountId: 'account-123',
      to: [{ email: 'contact@example.com', name: 'Contact' }],
      subject: 'Test Email',
      bodyText: 'Test',
    });

    const email = await emailRepo.findById(result.emailId);
    
    expect(email).toBeDefined();
    expect(email.direction).toBe('outbound');
    expect(email.subject).toBe('Test Email');
    expect(email.status).toBe('sent');
  });

  it('should store received email from sync', async () => {
    mockProvider.fetchEmails.mockResolvedValue({
      emails: [{
        externalId: 'msg-123',
        from: { email: 'sender@example.com', name: 'Sender' },
        to: [{ email: 'user@example.com', name: 'User' }],
        subject: 'Received Email',
        bodyText: 'Hello',
        sentAt: new Date(),
      }],
    });

    await syncService.syncAccount('account-123');

    const emails = await emailRepo.findByAccount('account-123');
    const receivedEmail = emails.find(e => e.subject === 'Received Email');
    
    expect(receivedEmail).toBeDefined();
    expect(receivedEmail.direction).toBe('inbound');
  });

  it('should link email to contact automatically', async () => {
    const contact = await contactRepo.create({
      email: 'sender@example.com',
      name: 'Sender',
    });

    mockProvider.fetchEmails.mockResolvedValue({
      emails: [{
        externalId: 'msg-123',
        from: { email: 'sender@example.com', name: 'Sender' },
        to: [{ email: 'user@example.com', name: 'User' }],
        subject: 'From Known Contact',
        bodyText: 'Hello',
        sentAt: new Date(),
      }],
    });

    await syncService.syncAccount('account-123');

    const emails = await emailRepo.findByContact(contact.id);
    expect(emails.length).toBeGreaterThan(0);
  });

  it('should create activity record for email', async () => {
    await emailService.sendEmail({
      accountId: 'account-123',
      to: [{ email: 'contact@example.com', name: 'Contact' }],
      subject: 'Test Email',
      bodyText: 'Test',
      contactIds: ['contact-123'],
    });

    const activities = await activityRepo.findByContact('contact-123');
    const emailActivity = activities.find(a => a.type === 'email_sent');
    
    expect(emailActivity).toBeDefined();
    expect(emailActivity.subject).toBe('Test Email');
  });

  it('should display emails on contact timeline', async () => {
    // Send email to contact
    await emailService.sendEmail({
      accountId: 'account-123',
      to: [{ email: 'contact@example.com', name: 'Contact' }],
      subject: 'Timeline Test',
      bodyText: 'Test',
      contactIds: ['contact-123'],
    });

    // Get contact timeline
    const timeline = await contactService.getTimeline('contact-123');
    const emailItems = timeline.filter(item => item.type === 'email');
    
    expect(emailItems.length).toBeGreaterThan(0);
    expect(emailItems[0].subject).toBe('Timeline Test');
  });
});
```

## Test Coverage Requirements

- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user journeys covered
- **Performance Tests**: Load and stress tests for sync operations

## Test Data Management

### Test Fixtures

```typescript
// test/fixtures/emails.ts

export const mockEmails = {
  inbound: {
    externalId: 'msg-inbound-123',
    from: { email: 'sender@example.com', name: 'External Sender' },
    to: [{ email: 'user@example.com', name: 'CRM User' }],
    subject: 'Inbound Test Email',
    bodyText: 'This is an inbound email',
    bodyHtml: '<p>This is an inbound email</p>',
    sentAt: new Date('2025-11-10T10:00:00Z'),
    direction: 'inbound',
  },
  outbound: {
    externalId: 'msg-outbound-456',
    from: { email: 'user@example.com', name: 'CRM User' },
    to: [{ email: 'recipient@example.com', name: 'Recipient' }],
    subject: 'Outbound Test Email',
    bodyText: 'This is an outbound email',
    bodyHtml: '<p>This is an outbound email</p>',
    sentAt: new Date('2025-11-10T11:00:00Z'),
    direction: 'outbound',
  },
};
```

## Continuous Integration

### Test Pipeline

```yaml
# .github/workflows/test.yml

name: Test Email Sync

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run unit tests
        run: npm run test:unit
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run migrations
        run: npm run db:migrate
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Start test environment
        run: docker-compose up -d
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-screenshots
          path: test/e2e/screenshots/
```

## Test Reporting

- Test results published to CI dashboard
- Coverage reports on Codecov
- Failed tests notify team on Slack
- Performance metrics tracked over time

## Manual Testing Checklist

### Pre-Release Testing

- [ ] Connect Gmail account successfully
- [ ] Connect Outlook account successfully
- [ ] Send email with plain text
- [ ] Send email with HTML formatting
- [ ] Send email with attachments
- [ ] Receive email and see it in inbox
- [ ] Email automatically linked to contact
- [ ] Email tracking pixel works
- [ ] Link click tracking works
- [ ] Email templates load and send
- [ ] Manual sync trigger works
- [ ] Webhook delivery works
- [ ] Email thread grouping works
- [ ] Search emails works
- [ ] Filter emails works
- [ ] Email appears on contact timeline
- [ ] Email appears on deal timeline
- [ ] Disconnect account works
- [ ] Reconnect account after token expiry

## Conclusion

This comprehensive testing strategy ensures the Two-Way Email Sync feature is robust, reliable, and meets all acceptance criteria. Regular execution of these tests will maintain quality throughout the feature lifecycle.
