# API Reference

Complete reference documentation for all SimpleCRM API endpoints.

## Base URL

```
https://api.yourcrm.com/api/v1
```

## Authentication

All API requests require an API key in the Authorization header:
```
Authorization: Bearer sk_your_api_key
```

---

## Data Import/Export Endpoints

### Import Data

Import contacts, companies, or deals in bulk.

**Endpoint:** `POST /api/v1/import`

**Request Body:**
```typescript
{
  type: 'contacts' | 'companies' | 'deals';
  data: Array<Contact | Company | Deal>;
  overwriteExisting?: boolean; // Default: false
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    imported: number;
    failed: number;
    errors?: string[];
  };
  error?: string;
  message?: string;
}
```

**Example:**
```bash
curl -X POST https://api.yourcrm.com/api/v1/import \
  -H "Authorization: Bearer sk_abc123" \
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
```

---

### Export Data

Export data with optional filters.

**Endpoint:** `POST /api/v1/export`

**Request Body:**
```typescript
{
  type: 'contacts' | 'companies' | 'deals';
  format: 'json' | 'csv';
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    owner?: string;
    status?: string;
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    data: any[];
    format: string;
    count: number;
    exportedAt: Date;
  };
  error?: string;
}
```

---

### Import Contacts from CSV

**Endpoint:** `POST /api/v1/import/contacts/csv`

**Headers:**
- `Content-Type: text/csv`

**Request Body:** CSV content with headers: name, email, phone, company, title, status

**Response:**
```typescript
{
  success: boolean;
  data?: {
    imported: number;
    failed: number;
  };
  error?: string;
}
```

---

### Export Contacts to CSV

**Endpoint:** `GET /api/v1/export/contacts/csv`

**Query Parameters:**
- `dateFrom` - Filter by creation date (ISO 8601)
- `dateTo` - Filter by creation date (ISO 8601)
- `owner` - Filter by owner ID
- `status` - Filter by status (lead, contact, customer)

**Response:** CSV file download

---

## Integration Endpoints

### List All Integrations

Get all configured integrations.

**Endpoint:** `GET /api/v1/integrations`

**Response:**
```typescript
{
  success: boolean;
  data?: IntegrationConfig[];
  error?: string;
}
```

---

### Get Integration by Type

**Endpoint:** `GET /api/v1/integrations/:type`

**Path Parameters:**
- `type` - Integration type (email, calendar, accounting, project_management)

**Response:**
```typescript
{
  success: boolean;
  data?: IntegrationConfig;
  error?: string;
}
```

---

### Configure Email Integration

**Endpoint:** `POST /api/v1/integrations/email`

**Request Body:**
```typescript
{
  provider: 'gmail' | 'outlook' | 'exchange';
  enabled: boolean;
  syncEnabled: boolean;
  trackOpens?: boolean;
  trackClicks?: boolean;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  };
  settings?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: EmailIntegration;
  error?: string;
  message?: string;
}
```

**Example:**
```bash
curl -X POST https://api.yourcrm.com/api/v1/integrations/email \
  -H "Authorization: Bearer sk_abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gmail",
    "enabled": true,
    "syncEnabled": true,
    "trackOpens": true
  }'
```

---

### Configure Calendar Integration

**Endpoint:** `POST /api/v1/integrations/calendar`

**Request Body:**
```typescript
{
  provider: 'google_calendar' | 'outlook_calendar';
  enabled: boolean;
  syncDirection: 'bidirectional' | 'to_crm' | 'from_crm';
  autoCreateMeetings?: boolean;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  };
  settings?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: CalendarIntegration;
  error?: string;
  message?: string;
}
```

---

### Configure Accounting Integration

**Endpoint:** `POST /api/v1/integrations/accounting`

**Request Body:**
```typescript
{
  provider: 'quickbooks' | 'xero' | 'freshbooks';
  enabled: boolean;
  syncInvoices?: boolean;
  syncPayments?: boolean;
  credentials?: {
    companyId?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
  };
  settings?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: AccountingIntegration;
  error?: string;
  message?: string;
}
```

---

### Configure Project Management Integration

**Endpoint:** `POST /api/v1/integrations/project-management`

**Request Body:**
```typescript
{
  provider: 'asana' | 'trello' | 'jira' | 'monday';
  enabled: boolean;
  autoCreateTasks?: boolean;
  syncDeadlines?: boolean;
  credentials?: {
    apiToken?: string;
    workspaceId?: string;
    boardId?: string;
  };
  settings?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: ProjectManagementIntegration;
  error?: string;
  message?: string;
}
```

---

### Test Integration Connection

Test if an integration is working correctly.

**Endpoint:** `POST /api/v1/integrations/:type/test`

**Path Parameters:**
- `type` - Integration type to test

**Response:**
```typescript
{
  success: boolean;
  data?: {
    connected: boolean;
    message: string;
  };
  error?: string;
}
```

---

### Delete Integration

Remove and disconnect an integration.

**Endpoint:** `DELETE /api/v1/integrations/:type`

**Path Parameters:**
- `type` - Integration type to delete

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

---

## Authentication Endpoints

### Create API Key

**Endpoint:** `POST /api/v1/keys`

**Request Body:**
```typescript
{
  name: string;
  scopes?: string[]; // Default: ['*']
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    key: string;
    name: string;
    userId: string;
    scopes: string[];
    rateLimit: number;
    createdAt: Date;
  };
  error?: string;
}
```

---

### Revoke API Key

**Endpoint:** `DELETE /api/v1/keys/:key`

**Path Parameters:**
- `key` - The API key to revoke

**Response:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

---

## Data Types

### Contact

```typescript
interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  address?: string;
  status: 'lead' | 'contact' | 'customer';
  owner?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Company

```typescript
interface Company {
  id: string;
  name: string;
  industry?: string;
  address?: string;
  phone?: string;
  website?: string;
  employees?: number;
  revenue?: number;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Deal

```typescript
interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  probability?: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  owner: string;
  contactId?: string;
  companyId?: string;
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Activity

```typescript
interface Activity {
  id: string;
  type: 'call' | 'meeting' | 'email' | 'task' | 'note';
  subject: string;
  description?: string;
  dueDate?: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'overdue';
  contactId?: string;
  dealId?: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Rate Limiting

- Default: **60 requests per minute**
- Burst: **120 requests per minute** for 10 seconds
- Exceeding limits returns **429 Too Many Requests**

**Rate Limit Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699632000
```

---

## Error Responses

All errors follow this format:

```typescript
{
  success: false;
  error: string;
}
```

**Common Error Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Versioning

The API uses URL versioning. The current version is `v1`.

Base URL: `https://api.yourcrm.com/api/v1`

---

## Support

For API support:
- Email: api-support@yourcrm.com
- Docs: https://docs.yourcrm.com/api
- Status: https://status.yourcrm.com
