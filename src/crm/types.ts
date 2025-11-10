/**
 * Core types for CRM lead capture and management
 */

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: LeadSource;
  productInterest?: string;
  geography?: string;
  message?: string;
  createdAt: Date;
  assignedTo?: string;
  status: LeadStatus;
  customFields?: Record<string, any>;
}

export enum LeadSource {
  WebForm = 'web_form',
  ChatWidget = 'chat_widget',
  Manual = 'manual',
  Import = 'import'
}

export enum LeadStatus {
  New = 'new',
  Contacted = 'contacted',
  Qualified = 'qualified',
  Unqualified = 'unqualified',
  Converted = 'converted'
}

export interface AssignmentRule {
  id: string;
  name: string;
  priority: number;
  conditions: AssignmentCondition[];
  assignTo: string;
  enabled: boolean;
}

export interface AssignmentCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'in';
  value: string | string[];
}

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  territories?: string[];
  productLines?: string[];
}
