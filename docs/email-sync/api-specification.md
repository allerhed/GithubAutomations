# Two-Way Email Sync - API Specification

## Overview

This document defines the REST API endpoints for the Two-Way Email Sync feature in SimpleCRM.

## Base URL

```
https://api.simplecrm.com/v1
```

## Authentication

All API requests require authentication using Bearer tokens:

```
Authorization: Bearer {access_token}
```

## Email Account Management

### Connect Email Account

Initiates OAuth flow to connect an email account.

**Request:**
```http
POST /api/email/connect
Content-Type: application/json

{
  "provider": "gmail",
  "redirectUri": "https://app.simplecrm.com/email/callback"
}
```

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "state": "random-state-string"
}
```

**Status Codes:**
- `200 OK` - OAuth URL generated successfully
- `400 Bad Request` - Invalid provider
- `401 Unauthorized` - User not authenticated

---

### OAuth Callback Handler

Handles the OAuth callback after user authorization.

**Request:**
```http
GET /api/email/callback?code={auth_code}&state={state}&provider={provider}
```

**Response:**
```json
{
  "success": true,
  "accountId": "acc_12345",
  "email": "user@example.com",
  "provider": "gmail"
}
```

**Status Codes:**
- `200 OK` - Account connected successfully
- `400 Bad Request` - Invalid authorization code
- `401 Unauthorized` - State mismatch

---

### Get Connected Accounts

Retrieves all connected email accounts for the current user.

**Request:**
```http
GET /api/email/accounts
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "acc_12345",
      "email": "user@example.com",
      "provider": "gmail",
      "status": "active",
      "lastSyncAt": "2025-11-10T15:30:00Z",
      "connectedAt": "2025-11-01T10:00:00Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Accounts retrieved successfully
- `401 Unauthorized` - User not authenticated

---

### Disconnect Email Account

Disconnects an email account from the CRM.

**Request:**
```http
DELETE /api/email/accounts/{accountId}
```

**Response:**
```json
{
  "success": true,
  "message": "Email account disconnected successfully"
}
```

**Status Codes:**
- `200 OK` - Account disconnected
- `404 Not Found` - Account not found
- `401 Unauthorized` - User not authenticated

---

### Get Sync Status

Retrieves the current sync status for an email account.

**Request:**
```http
GET /api/email/accounts/{accountId}/status
```

**Response:**
```json
{
  "accountId": "acc_12345",
  "status": "syncing",
  "lastSyncAt": "2025-11-10T15:30:00Z",
  "nextSyncAt": "2025-11-10T15:45:00Z",
  "emailsSynced": 1245,
  "syncErrors": 0
}
```

**Status Codes:**
- `200 OK` - Status retrieved successfully
- `404 Not Found` - Account not found
- `401 Unauthorized` - User not authenticated

---

## Email Operations

### Send Email

Sends an email via the connected email account.

**Request:**
```http
POST /api/email/send
Content-Type: application/json

{
  "accountId": "acc_12345",
  "to": [
    {
      "email": "recipient@example.com",
      "name": "John Doe"
    }
  ],
  "cc": [],
  "bcc": [],
  "subject": "Follow up on proposal",
  "bodyHtml": "<p>Hi John,</p><p>Following up on our discussion...</p>",
  "bodyText": "Hi John,\n\nFollowing up on our discussion...",
  "templateId": "tmpl_123",
  "templateVariables": {
    "firstName": "John",
    "company": "Acme Corp"
  },
  "attachments": [
    {
      "fileName": "proposal.pdf",
      "contentType": "application/pdf",
      "base64Content": "JVBERi0xLjQKJeLjz9M..."
    }
  ],
  "contactIds": ["contact_456"],
  "dealIds": ["deal_789"],
  "trackOpens": true,
  "trackClicks": true,
  "scheduledAt": "2025-11-11T09:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "emailId": "email_98765",
  "messageId": "<abc123@mail.gmail.com>",
  "status": "sent",
  "sentAt": "2025-11-10T15:32:00Z"
}
```

**Status Codes:**
- `200 OK` - Email sent successfully
- `202 Accepted` - Email scheduled for sending
- `400 Bad Request` - Invalid email data
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Account not found
- `429 Too Many Requests` - Rate limit exceeded

---

### Get Emails (Inbox)

Retrieves emails from the user's inbox.

**Request:**
```http
GET /api/email/inbox?accountId=acc_12345&page=1&limit=50&direction=inbound&unreadOnly=false
```

**Query Parameters:**
- `accountId` (required): Email account ID
- `page` (optional): Page number, default 1
- `limit` (optional): Results per page, default 50, max 100
- `direction` (optional): Filter by direction (inbound/outbound/all), default all
- `unreadOnly` (optional): Show only unread emails, default false
- `contactId` (optional): Filter by contact
- `dealId` (optional): Filter by deal

**Response:**
```json
{
  "emails": [
    {
      "id": "email_12345",
      "externalId": "msg_abc123",
      "threadId": "thread_xyz",
      "from": {
        "email": "sender@example.com",
        "name": "Jane Smith"
      },
      "to": [
        {
          "email": "user@example.com",
          "name": "User Name"
        }
      ],
      "subject": "Re: Proposal discussion",
      "snippet": "Thank you for your proposal. I have a few questions...",
      "bodyText": "Full text content...",
      "bodyHtml": "<html>Full HTML content...</html>",
      "direction": "inbound",
      "status": "delivered",
      "sentAt": "2025-11-10T14:20:00Z",
      "receivedAt": "2025-11-10T14:20:05Z",
      "attachments": [
        {
          "id": "att_456",
          "fileName": "document.pdf",
          "mimeType": "application/pdf",
          "size": 245632,
          "url": "https://cdn.simplecrm.com/attachments/att_456"
        }
      ],
      "contactIds": ["contact_789"],
      "dealIds": ["deal_123"],
      "opened": true,
      "openedAt": "2025-11-10T14:25:00Z",
      "unread": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "totalPages": 5
  }
}
```

**Status Codes:**
- `200 OK` - Emails retrieved successfully
- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Account not found

---

### Get Email Thread

Retrieves all emails in a conversation thread.

**Request:**
```http
GET /api/email/threads/{threadId}
```

**Response:**
```json
{
  "threadId": "thread_xyz",
  "subject": "Proposal discussion",
  "participants": [
    {
      "email": "user@example.com",
      "name": "User Name"
    },
    {
      "email": "sender@example.com",
      "name": "Jane Smith"
    }
  ],
  "emails": [
    {
      "id": "email_001",
      "from": {
        "email": "user@example.com",
        "name": "User Name"
      },
      "subject": "Proposal discussion",
      "bodyText": "Hi Jane, I wanted to discuss...",
      "sentAt": "2025-11-09T10:00:00Z",
      "direction": "outbound"
    },
    {
      "id": "email_002",
      "from": {
        "email": "sender@example.com",
        "name": "Jane Smith"
      },
      "subject": "Re: Proposal discussion",
      "bodyText": "Thank you for reaching out...",
      "sentAt": "2025-11-10T14:20:00Z",
      "direction": "inbound"
    }
  ],
  "contactIds": ["contact_789"],
  "dealIds": ["deal_123"]
}
```

**Status Codes:**
- `200 OK` - Thread retrieved successfully
- `404 Not Found` - Thread not found
- `401 Unauthorized` - User not authenticated

---

### Get Single Email

Retrieves details of a specific email.

**Request:**
```http
GET /api/email/{emailId}
```

**Response:**
```json
{
  "id": "email_12345",
  "externalId": "msg_abc123",
  "threadId": "thread_xyz",
  "from": {
    "email": "sender@example.com",
    "name": "Jane Smith"
  },
  "to": [
    {
      "email": "user@example.com",
      "name": "User Name"
    }
  ],
  "cc": [],
  "bcc": [],
  "subject": "Re: Proposal discussion",
  "bodyText": "Full text content...",
  "bodyHtml": "<html>Full HTML content...</html>",
  "direction": "inbound",
  "status": "delivered",
  "sentAt": "2025-11-10T14:20:00Z",
  "receivedAt": "2025-11-10T14:20:05Z",
  "attachments": [],
  "contactIds": ["contact_789"],
  "dealIds": ["deal_123"],
  "activityId": "activity_999",
  "opened": true,
  "openedAt": "2025-11-10T14:25:00Z",
  "clickedLinks": ["https://example.com/pricing"]
}
```

**Status Codes:**
- `200 OK` - Email retrieved successfully
- `404 Not Found` - Email not found
- `401 Unauthorized` - User not authenticated

---

### Trigger Manual Sync

Manually triggers email synchronization for an account.

**Request:**
```http
POST /api/email/sync
Content-Type: application/json

{
  "accountId": "acc_12345",
  "fullSync": false
}
```

**Query Parameters:**
- `fullSync` (optional): Perform full sync instead of incremental, default false

**Response:**
```json
{
  "success": true,
  "syncJobId": "job_456",
  "message": "Sync started successfully"
}
```

**Status Codes:**
- `202 Accepted` - Sync job started
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Account not found
- `429 Too Many Requests` - Sync already in progress

---

### Link Email to Contact/Deal

Links an email to contacts or deals.

**Request:**
```http
POST /api/email/{emailId}/link
Content-Type: application/json

{
  "contactIds": ["contact_456", "contact_789"],
  "dealIds": ["deal_123"]
}
```

**Response:**
```json
{
  "success": true,
  "emailId": "email_12345",
  "linkedContacts": 2,
  "linkedDeals": 1
}
```

**Status Codes:**
- `200 OK` - Email linked successfully
- `400 Bad Request` - Invalid IDs
- `404 Not Found` - Email not found
- `401 Unauthorized` - User not authenticated

---

## Email Templates

### List Templates

Retrieves available email templates.

**Request:**
```http
GET /api/email/templates?category=sales&page=1&limit=20
```

**Response:**
```json
{
  "templates": [
    {
      "id": "tmpl_123",
      "name": "Initial Outreach",
      "category": "sales",
      "subject": "Quick question about {{company}}",
      "bodyHtml": "<p>Hi {{firstName}},</p><p>I wanted to reach out...</p>",
      "variables": ["firstName", "company", "industry"],
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

**Status Codes:**
- `200 OK` - Templates retrieved successfully
- `401 Unauthorized` - User not authenticated

---

## Webhooks

### Gmail Webhook Handler

Receives push notifications from Gmail.

**Request:**
```http
POST /api/email/webhooks/gmail
Content-Type: application/json
X-Goog-Channel-ID: channel-identifier
X-Goog-Resource-State: update

{
  "message": {
    "data": "eyJlbWFpbEFkZHJlc3MiOiAidXNlckBleGFtcGxlLmNvbSIsICJoaXN0b3J5SWQiOiAiMTIzNDUifQ==",
    "messageId": "msg_id",
    "publishTime": "2025-11-10T15:30:00Z"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK` - Webhook processed
- `400 Bad Request` - Invalid payload

---

### Outlook Webhook Handler

Receives change notifications from Microsoft Graph.

**Request:**
```http
POST /api/email/webhooks/outlook
Content-Type: application/json

{
  "value": [
    {
      "subscriptionId": "sub_123",
      "clientState": "secret-client-state",
      "changeType": "created",
      "resource": "Users/user@example.com/Messages/msg_abc",
      "subscriptionExpirationDateTime": "2025-11-11T15:00:00Z",
      "resourceData": {
        "id": "msg_abc"
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK` - Webhook processed
- `400 Bad Request` - Invalid payload

---

## Email Tracking

### Track Email Open

Records when an email is opened (via tracking pixel).

**Request:**
```http
GET /api/email/track/open/{emailId}/{trackingToken}.png
```

**Response:**
- Returns 1x1 transparent PNG image
- Records open event in database

**Status Codes:**
- `200 OK` - Tracking pixel served
- `404 Not Found` - Invalid tracking token

---

### Track Link Click

Records when a link in an email is clicked.

**Request:**
```http
GET /api/email/track/click/{emailId}/{trackingToken}?url={encoded_url}
```

**Response:**
- Redirects to original URL
- Records click event in database

**Status Codes:**
- `302 Found` - Redirect to original URL
- `404 Not Found` - Invalid tracking token

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Email account not found",
  "code": "ACCOUNT_NOT_FOUND"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

## Rate Limits

- **Email Send**: 100 emails per hour per account
- **Sync Trigger**: 1 request per minute per account
- **General API**: 1000 requests per hour per user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699632000
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

### Filtering
```
GET /api/email/inbox?contactId=contact_123&direction=inbound&unreadOnly=true
```

### Sorting
```
GET /api/email/inbox?sortBy=sentAt&sortOrder=desc
```

Available sort fields:
- `sentAt`: Email sent timestamp
- `receivedAt`: Email received timestamp
- `subject`: Email subject (alphabetical)

Sort order:
- `asc`: Ascending
- `desc`: Descending (default)
