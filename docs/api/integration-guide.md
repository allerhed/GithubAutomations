# API Integration Guide

This guide provides comprehensive documentation for integrating with the SimpleCRM API.

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Data Import/Export](#data-importexport)
4. [Third-Party Integrations](#third-party-integrations)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)

## Authentication

All API requests require authentication using an API key. Include your API key in the `Authorization` header:

```
Authorization: Bearer sk_your_api_key_here
```

### Creating an API Key

API keys can be created through the CRM dashboard or programmatically:

```typescript
POST /api/v1/keys
Content-Type: application/json

{
  "name": "My Integration Key",
  "scopes": ["contacts:read", "contacts:write", "deals:read"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "sk_abc123...",
    "name": "My Integration Key",
    "rateLimit": 60,
    "createdAt": "2025-11-10T12:00:00Z"
  }
}
```

⚠️ **Important**: Store your API key securely. It will only be shown once.

## Rate Limiting

Default rate limits:
- **60 requests per minute** per API key
- Burst allowance: **120 requests per minute** for up to 10 seconds

Rate limit headers are included in every response:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699632000
```

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 30
}
```

## Data Import/Export

### Import Data

Import contacts, companies, or deals in bulk.

**Endpoint:** `POST /api/v1/import`

**Request:**
```json
{
  "type": "contacts",
  "overwriteExisting": false,
  "data": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Acme Corp",
      "status": "lead"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 1,
    "failed": 0
  },
  "message": "Successfully imported 1 contacts, 0 failed"
}
```

### Export Data

Export data with optional filters.

**Endpoint:** `POST /api/v1/export`

**Request:**
```json
{
  "type": "contacts",
  "format": "json",
  "filters": {
    "dateFrom": "2025-01-01T00:00:00Z",
    "owner": "user123",
    "status": "customer"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "format": "json",
    "count": 150,
    "exportedAt": "2025-11-10T12:00:00Z"
  }
}
```

### CSV Import/Export

**Import Contacts from CSV:**
```
POST /api/v1/import/contacts/csv
Content-Type: text/csv

name,email,phone,company,status
John Doe,john@example.com,+1234567890,Acme Corp,lead
Jane Smith,jane@example.com,+0987654321,Beta Inc,contact
```

**Export Contacts to CSV:**
```
GET /api/v1/export/contacts/csv?status=customer&dateFrom=2025-01-01
```

## Third-Party Integrations

### Email Integration

Connect Gmail, Outlook, or Exchange for two-way email sync.

**Endpoint:** `POST /api/v1/integrations/email`

**Request:**
```json
{
  "provider": "gmail",
  "enabled": true,
  "syncEnabled": true,
  "trackOpens": true,
  "trackClicks": true,
  "credentials": {
    "clientId": "your-oauth-client-id",
    "clientSecret": "your-oauth-client-secret"
  }
}
```

**Supported Providers:**
- `gmail` - Google Gmail
- `outlook` - Microsoft Outlook
- `exchange` - Microsoft Exchange Server

**Features:**
- Two-way email synchronization
- Email open and click tracking
- Template-based email sending
- Communication history logging

### Calendar Integration

Sync meetings and activities with your calendar.

**Endpoint:** `POST /api/v1/integrations/calendar`

**Request:**
```json
{
  "provider": "google_calendar",
  "enabled": true,
  "syncDirection": "bidirectional",
  "autoCreateMeetings": true,
  "credentials": {
    "clientId": "your-oauth-client-id",
    "clientSecret": "your-oauth-client-secret"
  }
}
```

**Supported Providers:**
- `google_calendar` - Google Calendar
- `outlook_calendar` - Microsoft Outlook Calendar

**Sync Directions:**
- `bidirectional` - Sync both ways
- `to_crm` - Import calendar events to CRM
- `from_crm` - Export CRM activities to calendar

### Accounting Software Integration

Integrate with accounting systems for invoice and payment tracking.

**Endpoint:** `POST /api/v1/integrations/accounting`

**Request:**
```json
{
  "provider": "quickbooks",
  "enabled": true,
  "syncInvoices": true,
  "syncPayments": true,
  "credentials": {
    "companyId": "your-company-id",
    "clientId": "your-oauth-client-id",
    "clientSecret": "your-oauth-client-secret"
  }
}
```

**Supported Providers:**
- `quickbooks` - QuickBooks Online
- `xero` - Xero
- `freshbooks` - FreshBooks

**Features:**
- Automatic invoice creation from deals
- Payment status synchronization
- Revenue tracking
- Customer account linking

### Project Management Integration

Connect with project management tools for deal-to-project conversion.

**Endpoint:** `POST /api/v1/integrations/project-management`

**Request:**
```json
{
  "provider": "asana",
  "enabled": true,
  "autoCreateTasks": true,
  "syncDeadlines": true,
  "credentials": {
    "apiToken": "your-api-token",
    "workspaceId": "your-workspace-id"
  }
}
```

**Supported Providers:**
- `asana` - Asana
- `trello` - Trello
- `jira` - Jira
- `monday` - Monday.com

**Features:**
- Automatic project creation from won deals
- Task synchronization
- Deadline tracking
- Team collaboration

### Managing Integrations

**List All Integrations:**
```
GET /api/v1/integrations
```

**Get Specific Integration:**
```
GET /api/v1/integrations/email
```

**Test Integration Connection:**
```
POST /api/v1/integrations/email/test
```

**Delete Integration:**
```
DELETE /api/v1/integrations/email
```

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid or missing API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Code Examples

### JavaScript/TypeScript

```typescript
import { importData, configureEmailIntegration } from './api';

// Import contacts
const result = await importData({
  type: 'contacts',
  data: [
    {
      id: 'c1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'lead',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
});

// Configure Gmail integration
const emailIntegration = await configureEmailIntegration({
  provider: 'gmail',
  enabled: true,
  syncEnabled: true,
  trackOpens: true,
  credentials: { /* OAuth credentials */ }
});
```

### Python

```python
import requests

API_KEY = "sk_your_api_key"
BASE_URL = "https://api.yourcrm.com/api/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Import contacts
response = requests.post(
    f"{BASE_URL}/import",
    headers=headers,
    json={
        "type": "contacts",
        "data": [
            {
                "name": "John Doe",
                "email": "john@example.com",
                "status": "lead"
            }
        ]
    }
)

print(response.json())
```

### cURL

```bash
# Import contacts
curl -X POST https://api.yourcrm.com/api/v1/import \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contacts",
    "data": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "status": "lead"
      }
    ]
  }'

# Configure email integration
curl -X POST https://api.yourcrm.com/api/v1/integrations/email \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gmail",
    "enabled": true,
    "syncEnabled": true
  }'
```

## Webhooks

Configure webhooks to receive real-time notifications about CRM events:

**Endpoint:** `POST /api/v1/webhooks`

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["contact.created", "deal.won", "activity.completed"],
  "secret": "your-webhook-secret"
}
```

**Webhook Event Example:**
```json
{
  "event": "contact.created",
  "timestamp": "2025-11-10T12:00:00Z",
  "data": {
    "id": "contact_123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Support

For API support and questions:
- Documentation: https://docs.yourcrm.com/api
- Support Email: api-support@yourcrm.com
- Status Page: https://status.yourcrm.com
