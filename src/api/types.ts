// API Types and Interfaces for CRM Integration

export interface Contact {
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

export interface Company {
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

export interface Deal {
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

export interface Activity {
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

export interface ImportRequest {
  data: Contact[] | Company[] | Deal[];
  type: 'contacts' | 'companies' | 'deals';
  overwriteExisting?: boolean;
}

export interface ExportRequest {
  type: 'contacts' | 'companies' | 'deals';
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    owner?: string;
    status?: string;
  };
  format: 'json' | 'csv';
}

export interface ExportResponse {
  data: any[];
  format: string;
  count: number;
  exportedAt: Date;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IntegrationConfig {
  type: 'email' | 'calendar' | 'accounting' | 'project_management';
  provider: string;
  apiKey?: string;
  credentials?: Record<string, any>;
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface EmailIntegration extends IntegrationConfig {
  type: 'email';
  provider: 'gmail' | 'outlook' | 'exchange';
  syncEnabled: boolean;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface CalendarIntegration extends IntegrationConfig {
  type: 'calendar';
  provider: 'google_calendar' | 'outlook_calendar';
  syncDirection: 'bidirectional' | 'to_crm' | 'from_crm';
  autoCreateMeetings?: boolean;
}

export interface AccountingIntegration extends IntegrationConfig {
  type: 'accounting';
  provider: 'quickbooks' | 'xero' | 'freshbooks';
  syncInvoices?: boolean;
  syncPayments?: boolean;
}

export interface ProjectManagementIntegration extends IntegrationConfig {
  type: 'project_management';
  provider: 'asana' | 'trello' | 'jira' | 'monday';
  autoCreateTasks?: boolean;
  syncDeadlines?: boolean;
}
