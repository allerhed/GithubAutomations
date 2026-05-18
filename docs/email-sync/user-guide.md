# Two-Way Email Sync - User Guide

## Overview

SimpleCRM's Two-Way Email Sync allows you to connect your email accounts (Gmail, Outlook) to send, receive, and track emails directly from the CRM. All email communication is automatically logged and linked to your contacts and deals.

## Getting Started

### Connecting Your Email Account

1. **Navigate to Settings**
   - Click your profile icon in the top-right
   - Select "Settings" → "Email Accounts"

2. **Choose Your Email Provider**
   - Click "Connect Email Account"
   - Select your provider (Gmail or Outlook)

3. **Authorize Access**
   - You'll be redirected to your email provider's login page
   - Sign in with your email account
   - Review the permissions requested:
     - Read your emails
     - Send emails on your behalf
     - Manage email labels/folders
   - Click "Allow" or "Accept"

4. **Confirmation**
   - You'll be redirected back to SimpleCRM
   - Your email account is now connected!
   - Initial sync will begin automatically (may take a few minutes)

### What Gets Synced?

**Automatically Synced:**
- ✅ All emails from your inbox
- ✅ Sent emails from your account
- ✅ Email attachments
- ✅ Email threads (conversations)

**Not Synced:**
- ❌ Spam/Junk folder
- ❌ Trash/Deleted items
- ❌ Drafts (unless explicitly saved in CRM)

## Sending Emails from CRM

### Method 1: From Contact Page

1. Open a contact's profile
2. Click the "Send Email" button
3. The email composer opens with:
   - Recipient pre-filled with contact's email
   - Subject line blank
   - Body blank
4. Compose your email
5. Click "Send"

### Method 2: From Deal Page

1. Open a deal
2. Click "Activity" tab
3. Click "+ New Activity" → "Send Email"
4. Email composer opens with deal contacts suggested
5. Compose and send

### Method 3: From Email Inbox

1. Navigate to "Emails" in the main menu
2. Click "Compose" button
3. Fill in recipient, subject, and body
4. Click "Send"

### Email Composer Features

#### Rich Text Formatting
- **Bold**, *Italic*, <u>Underline</u>
- Bullet points and numbered lists
- Font size and color
- Insert links
- Insert images

#### Using Email Templates

1. Click "Templates" dropdown in composer
2. Browse available templates
3. Select a template
4. Template variables are automatically filled:
   - `{{firstName}}` → Contact's first name
   - `{{company}}` → Contact's company
   - `{{dealValue}}` → Deal value
5. Customize as needed
6. Send

#### Attaching Files

1. Click the paperclip icon
2. Choose file from your computer (max 25MB per file)
3. File uploads and appears in composer
4. Add multiple files (max 50MB total)
5. Send email

#### Scheduling Emails

1. Compose your email
2. Click the clock icon
3. Choose date and time
4. Click "Schedule"
5. Email will be sent automatically at scheduled time

#### Tracking Options

- **Track Opens**: Know when recipient opens your email
- **Track Clicks**: Know when recipient clicks links
- Toggle these options on/off before sending

⚠️ **Privacy Note**: Some recipients may have email clients that block tracking pixels. Tracking is not 100% accurate.

## Managing Your Inbox

### Viewing Emails

1. Navigate to "Emails" in main menu
2. See all emails (sent and received)
3. Filter by:
   - **Direction**: Inbound, Outbound, or All
   - **Contact**: Emails with specific contact
   - **Deal**: Emails related to specific deal
   - **Read/Unread**: Filter by read status
   - **Date Range**: Custom date range

### Email Thread View

- Emails are grouped by conversation thread
- Click any email to see the full thread
- All replies and forwards shown chronologically
- Expand/collapse individual emails in thread

### Linking Emails to CRM Records

**Automatic Linking:**
- Emails are automatically linked to contacts if sender/recipient exists in CRM
- Emails are linked to deals if contact is associated with active deal

**Manual Linking:**
1. Open an email
2. Click "Link to Contact/Deal"
3. Search for contact or deal
4. Select from results
5. Email is now linked

### Marking Emails

- **Star Important Emails**: Click star icon to mark as important
- **Mark as Read/Unread**: Click to toggle read status
- **Archive**: Remove from inbox but keep searchable

## Email Templates

### Using Pre-Built Templates

1. Navigate to "Settings" → "Email Templates"
2. Browse available templates by category:
   - Sales Outreach
   - Follow-up
   - Meeting Requests
   - Proposals
   - Thank You Notes
3. Click "Preview" to see template
4. Click "Use Template" to compose with it

### Creating Custom Templates

1. Go to "Settings" → "Email Templates"
2. Click "Create Template"
3. Fill in:
   - **Template Name**: Internal name (e.g., "Product Demo Invite")
   - **Category**: Choose or create category
   - **Subject**: Email subject (can use variables)
   - **Body**: Email content with formatting
4. Insert variables:
   - Type `{{` to see available variables
   - Common variables:
     - `{{firstName}}`, `{{lastName}}`
     - `{{company}}`, `{{title}}`
     - `{{dealValue}}`, `{{dealStage}}`
     - `{{userFirstName}}` (your name)
5. Save template

### Sharing Templates with Team

1. Open your template
2. Click "Share with Team"
3. Team members can now use this template
4. Only you and admins can edit

## Email Tracking & Analytics

### View Email Opens

1. Open an email you sent
2. See "Opened" indicator:
   - ✅ **Opened**: Shows first open date/time
   - 👁️ **Multiple Opens**: Shows count and times
   - ❌ **Not Opened**: No opens detected yet

### View Link Clicks

1. Open an email with tracked links
2. See "Clicks" section
3. View which links were clicked and when
4. Total click count displayed

### Email Activity Timeline

1. Navigate to Contact or Deal page
2. View "Activity" tab
3. All emails sent/received shown chronologically
4. Quick view of email opens and clicks

### Email Reports

1. Navigate to "Reports" → "Email Activity"
2. View metrics:
   - Emails sent per day/week/month
   - Open rate (% of sent emails opened)
   - Click rate (% of sent emails with clicks)
   - Response rate (% of sent emails with replies)
   - Best performing templates
3. Filter by:
   - Date range
   - User
   - Template
   - Contact/Deal

## Troubleshooting

### Email Account Not Syncing

**Symptoms:** New emails not appearing in CRM

**Solutions:**
1. Check connection status:
   - Go to Settings → Email Accounts
   - Check if account shows "Active" status
2. Trigger manual sync:
   - Click "Sync Now" button
   - Wait 1-2 minutes
3. Reconnect account:
   - Click "Disconnect"
   - Click "Connect" and re-authorize
4. Contact support if issue persists

### Cannot Send Emails

**Symptoms:** Emails stuck in "Sending" or error message

**Solutions:**
1. Check internet connection
2. Verify email account is still connected
3. Check recipient email addresses are valid
4. Ensure attachment size is under 25MB
5. Try disconnecting and reconnecting email account

### Tracking Not Working

**Symptoms:** Emails show as "Not Opened" despite being opened

**Possible Reasons:**
- Recipient has images blocked in email client
- Recipient is using privacy-focused email client
- Corporate firewall blocking tracking pixels
- Email opened in plain text mode

**Note:** Email tracking is not 100% reliable. Use as a guide, not absolute truth.

### Missing Emails

**Symptoms:** Some emails not appearing in CRM

**Check:**
1. Are they in Spam/Trash folder? (These aren't synced)
2. Are they older than initial sync date?
3. Check email filters in CRM (might be filtered out)
4. Trigger manual sync

### Token Expired Error

**Symptoms:** "Authentication failed" or "Token expired" message

**Solution:**
1. Go to Settings → Email Accounts
2. Click "Reconnect" next to affected account
3. Complete authorization again
4. Sync should resume automatically

## Privacy & Security

### What Data is Stored?

- Email subject and body
- Sender and recipient addresses
- Date and time sent/received
- Attachments
- Opens and clicks (if tracking enabled)

### Who Can See My Emails?

- **You**: Full access to your emails
- **Your Manager**: Can view your emails (if permissions granted)
- **Admins**: Can view all emails in organization
- **Team Members**: Cannot see your emails unless shared

### Disconnecting Your Email

1. Go to Settings → Email Accounts
2. Click "Disconnect" next to account
3. Confirm disconnection
4. Your emails remain in CRM for 30 days
5. After 30 days, emails are permanently deleted

### Data Privacy

- All emails encrypted at rest
- Transmitted over secure HTTPS connection
- Email tracking complies with privacy regulations
- Recipients can opt-out of tracking
- You can disable tracking anytime

## Best Practices

### ✅ Do's

1. **Use Templates**: Save time with templates for common emails
2. **Link Emails**: Always link important emails to contacts/deals
3. **Track Strategically**: Enable tracking for important outreach
4. **Clean Inbox**: Archive old emails regularly
5. **Personalize**: Always personalize template variables
6. **Schedule**: Use scheduling for optimal send times
7. **Follow Up**: Set reminders for email follow-ups

### ❌ Don'ts

1. **Bulk Sending**: Don't send mass emails (use email marketing tool)
2. **Spam**: Don't send unsolicited emails
3. **Over-Track**: Don't track every single email
4. **Ignore Privacy**: Always respect recipient privacy
5. **Share Passwords**: Never share email account passwords
6. **Use Personal Email**: Use business email accounts only

## Tips for Success

### Writing Effective Sales Emails

1. **Clear Subject**: Make subject line specific and relevant
2. **Personalize**: Use recipient's name and company
3. **Be Concise**: Keep emails short (3-5 paragraphs max)
4. **Value Proposition**: Lead with value to recipient
5. **One CTA**: Single clear call-to-action
6. **Proofread**: Always check for typos and errors

### Improving Open Rates

- Send at optimal times (Tuesday-Thursday, 10am-11am)
- Use compelling subject lines (curiosity, value, urgency)
- Personalize subject line with recipient's name
- Keep subject under 50 characters
- Avoid spam trigger words (FREE, BUY NOW, LIMITED TIME)

### Improving Response Rates

- Ask specific questions
- Make emails easy to respond to
- Provide multiple response options
- Include your contact information
- Follow up after 3-5 days if no response

## Keyboard Shortcuts

- `C`: Compose new email
- `R`: Reply to selected email
- `F`: Forward selected email
- `E`: Archive selected email
- `S`: Star selected email
- `U`: Mark as unread
- `/`: Focus search
- `Esc`: Close composer/modal

## Getting Help

### Support Resources

- **Help Center**: https://help.simplecrm.com/email-sync
- **Video Tutorials**: https://simplecrm.com/tutorials/email
- **Email Support**: support@simplecrm.com
- **Live Chat**: Available in-app (bottom-right corner)
- **Phone Support**: (555) 123-4567 (Business hours)

### Common Questions

**Q: How long does initial sync take?**
A: Typically 5-15 minutes depending on email volume. Large inboxes (10,000+ emails) may take up to 1 hour.

**Q: Can I connect multiple email accounts?**
A: Yes! You can connect as many email accounts as needed.

**Q: Can I send from different email accounts?**
A: Yes, select which account to send from in the composer.

**Q: Are emails synced in real-time?**
A: Yes, emails sync within 1-2 minutes of being sent/received.

**Q: Can I import old emails?**
A: Initial sync imports emails from the last 6 months. Contact support for historical imports.

**Q: Is email sync available on mobile?**
A: Yes, mobile apps support full email sync and sending.

## Updates & Changelog

Check our [Release Notes](https://simplecrm.com/releases) for latest email sync features and improvements.

**Recent Updates:**
- 2025-11: Added scheduled sending
- 2025-10: Improved email tracking accuracy
- 2025-09: Added email templates v2
- 2025-08: Outlook integration launched
- 2025-07: Gmail integration launched
