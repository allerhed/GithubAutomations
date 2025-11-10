/**
 * Workflow Automation Types
 * 
 * Core type definitions for the workflow automation system
 */

export enum TriggerType {
  DEAL_STAGE_CHANGED = 'deal_stage_changed',
  DEAL_CREATED = 'deal_created',
  DEAL_WON = 'deal_won',
  DEAL_LOST = 'deal_lost',
  CONTACT_CREATED = 'contact_created',
  ACTIVITY_COMPLETED = 'activity_completed',
  FIELD_UPDATED = 'field_updated',
  TIME_BASED = 'time_based',
}

export enum ActionType {
  SCHEDULE_ACTIVITY = 'schedule_activity',
  SEND_EMAIL = 'send_email',
  UPDATE_FIELD = 'update_field',
  CREATE_TASK = 'create_task',
  ASSIGN_OWNER = 'assign_owner',
  SEND_NOTIFICATION = 'send_notification',
  WEBHOOK = 'webhook',
}

export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  FOLLOW_UP = 'follow_up',
  TASK = 'task',
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface WorkflowTrigger {
  type: TriggerType;
  conditions?: TriggerCondition[];
  timeDelay?: number; // in minutes
}

export interface WorkflowAction {
  type: ActionType;
  config: {
    activityType?: ActivityType;
    subject?: string;
    description?: string;
    dueDate?: string | number; // ISO string or days from now
    assignTo?: string;
    emailTemplate?: string;
    emailTo?: string[];
    fieldName?: string;
    fieldValue?: any;
    webhookUrl?: string;
    notificationMessage?: string;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  executionCount?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  tags: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggeredAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  context: {
    dealId?: string;
    contactId?: string;
    userId?: string;
    [key: string]: any;
  };
}
