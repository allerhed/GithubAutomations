/**
 * Pre-built Workflow Templates
 * 
 * Collection of ready-to-use workflow templates for common scenarios
 */

import {
  WorkflowTemplate,
  TriggerType,
  ActionType,
  ActivityType,
} from './types';

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'template_deal_won_followup',
    name: 'Deal Won Follow-up',
    description: 'Automatically schedule a thank you call and send a welcome email when a deal is won',
    category: 'Deal Management',
    trigger: {
      type: TriggerType.DEAL_WON,
    },
    actions: [
      {
        type: ActionType.SEND_EMAIL,
        config: {
          emailTemplate: 'deal_won_welcome',
          subject: 'Thank you for your business!',
        },
      },
      {
        type: ActionType.SCHEDULE_ACTIVITY,
        config: {
          activityType: ActivityType.CALL,
          subject: 'Thank you call',
          description: 'Call customer to thank them and ensure smooth onboarding',
          dueDate: 2, // 2 days from now
        },
      },
      {
        type: ActionType.UPDATE_FIELD,
        config: {
          fieldName: 'customer_status',
          fieldValue: 'active',
        },
      },
    ],
    tags: ['deal', 'won', 'follow-up', 'onboarding'],
  },
  {
    id: 'template_stage_progression',
    name: 'Deal Stage Progression',
    description: 'Automatically schedule follow-up activities when a deal moves to a new stage',
    category: 'Deal Management',
    trigger: {
      type: TriggerType.DEAL_STAGE_CHANGED,
    },
    actions: [
      {
        type: ActionType.SCHEDULE_ACTIVITY,
        config: {
          activityType: ActivityType.FOLLOW_UP,
          subject: 'Follow up on deal progression',
          description: 'Check in with customer about next steps',
          dueDate: 3,
        },
      },
      {
        type: ActionType.SEND_NOTIFICATION,
        config: {
          notificationMessage: 'Deal has moved to a new stage. Review and take action.',
        },
      },
    ],
    tags: ['deal', 'stage', 'follow-up'],
  },
  {
    id: 'template_new_lead_assignment',
    name: 'New Lead Auto-Assignment',
    description: 'Automatically assign new leads to sales reps and schedule first contact',
    category: 'Lead Management',
    trigger: {
      type: TriggerType.CONTACT_CREATED,
      conditions: [
        {
          field: 'type',
          operator: 'equals',
          value: 'lead',
        },
      ],
    },
    actions: [
      {
        type: ActionType.ASSIGN_OWNER,
        config: {
          assignTo: 'round_robin', // or specific user
        },
      },
      {
        type: ActionType.SCHEDULE_ACTIVITY,
        config: {
          activityType: ActivityType.CALL,
          subject: 'Initial lead contact',
          description: 'Reach out to new lead within 24 hours',
          dueDate: 1,
        },
      },
      {
        type: ActionType.SEND_EMAIL,
        config: {
          emailTemplate: 'new_lead_intro',
          subject: 'Welcome! Let\'s connect',
        },
      },
    ],
    tags: ['lead', 'assignment', 'first-contact'],
  },
  {
    id: 'template_stale_deal_alert',
    name: 'Stale Deal Alert',
    description: 'Send alerts and schedule follow-ups for deals that haven\'t been updated recently',
    category: 'Deal Management',
    trigger: {
      type: TriggerType.TIME_BASED,
      conditions: [
        {
          field: 'days_since_update',
          operator: 'greater_than',
          value: 14,
        },
        {
          field: 'stage',
          operator: 'not_equals',
          value: 'won',
        },
        {
          field: 'stage',
          operator: 'not_equals',
          value: 'lost',
        },
      ],
    },
    actions: [
      {
        type: ActionType.SEND_NOTIFICATION,
        config: {
          notificationMessage: 'This deal has not been updated in 14 days. Please review and update.',
        },
      },
      {
        type: ActionType.SCHEDULE_ACTIVITY,
        config: {
          activityType: ActivityType.FOLLOW_UP,
          subject: 'Re-engage with stale deal',
          description: 'Contact customer to move deal forward or close',
          dueDate: 1,
        },
      },
      {
        type: ActionType.UPDATE_FIELD,
        config: {
          fieldName: 'priority',
          fieldValue: 'high',
        },
      },
    ],
    tags: ['deal', 'stale', 'alert', 'priority'],
  },
  {
    id: 'template_proposal_sent',
    name: 'Proposal Sent Follow-up',
    description: 'Automatically schedule follow-up activities after sending a proposal',
    category: 'Sales Process',
    trigger: {
      type: TriggerType.DEAL_STAGE_CHANGED,
      conditions: [
        {
          field: 'newStage',
          operator: 'equals',
          value: 'proposal_sent',
        },
      ],
    },
    actions: [
      {
        type: ActionType.SCHEDULE_ACTIVITY,
        config: {
          activityType: ActivityType.CALL,
          subject: 'Proposal follow-up call',
          description: 'Check if customer received proposal and answer any questions',
          dueDate: 2,
        },
      },
      {
        type: ActionType.SCHEDULE_ACTIVITY,
        config: {
          activityType: ActivityType.EMAIL,
          subject: 'Proposal check-in email',
          description: 'Send email checking if there are any questions about the proposal',
          dueDate: 5,
        },
      },
      {
        type: ActionType.SEND_NOTIFICATION,
        config: {
          notificationMessage: 'Proposal sent. Follow-up activities scheduled.',
        },
      },
    ],
    tags: ['proposal', 'follow-up', 'sales'],
  },
  {
    id: 'template_meeting_scheduled',
    name: 'Meeting Preparation',
    description: 'Prepare for upcoming meetings by creating tasks and sending reminders',
    category: 'Activity Management',
    trigger: {
      type: TriggerType.ACTIVITY_COMPLETED,
      conditions: [
        {
          field: 'activityType',
          operator: 'equals',
          value: 'meeting_scheduled',
        },
      ],
    },
    actions: [
      {
        type: ActionType.CREATE_TASK,
        config: {
          subject: 'Prepare meeting agenda',
          description: 'Review customer history and prepare meeting agenda',
          dueDate: 1,
        },
      },
      {
        type: ActionType.CREATE_TASK,
        config: {
          subject: 'Research customer background',
          description: 'Research customer\'s company, industry, and recent news',
          dueDate: 1,
        },
      },
      {
        type: ActionType.SEND_EMAIL,
        config: {
          emailTemplate: 'meeting_confirmation',
          subject: 'Looking forward to our meeting',
        },
      },
    ],
    tags: ['meeting', 'preparation', 'tasks'],
  },
  {
    id: 'template_lost_deal_analysis',
    name: 'Lost Deal Analysis',
    description: 'Capture feedback and schedule analysis when a deal is lost',
    category: 'Deal Management',
    trigger: {
      type: TriggerType.DEAL_LOST,
    },
    actions: [
      {
        type: ActionType.CREATE_TASK,
        config: {
          subject: 'Document loss reason',
          description: 'Document why the deal was lost and any lessons learned',
          dueDate: 0,
        },
      },
      {
        type: ActionType.SCHEDULE_ACTIVITY,
        config: {
          activityType: ActivityType.FOLLOW_UP,
          subject: 'Future opportunity check-in',
          description: 'Check in with prospect about future opportunities',
          dueDate: 90, // 3 months later
        },
      },
      {
        type: ActionType.UPDATE_FIELD,
        config: {
          fieldName: 'follow_up_date',
          fieldValue: 90,
        },
      },
    ],
    tags: ['deal', 'lost', 'analysis', 'future'],
  },
  {
    id: 'template_high_value_deal',
    name: 'High-Value Deal Monitoring',
    description: 'Special handling and notifications for high-value deals',
    category: 'Deal Management',
    trigger: {
      type: TriggerType.DEAL_CREATED,
      conditions: [
        {
          field: 'value',
          operator: 'greater_than',
          value: 50000,
        },
      ],
    },
    actions: [
      {
        type: ActionType.SEND_NOTIFICATION,
        config: {
          notificationMessage: 'High-value deal created! Review and prioritize.',
        },
      },
      {
        type: ActionType.UPDATE_FIELD,
        config: {
          fieldName: 'priority',
          fieldValue: 'high',
        },
      },
      {
        type: ActionType.SCHEDULE_ACTIVITY,
        config: {
          activityType: ActivityType.MEETING,
          subject: 'High-value deal strategy meeting',
          description: 'Plan approach for this high-value opportunity',
          dueDate: 1,
        },
      },
      {
        type: ActionType.WEBHOOK,
        config: {
          webhookUrl: '/api/notifications/high-value-deal',
        },
      },
    ],
    tags: ['deal', 'high-value', 'priority', 'monitoring'],
  },
];

/**
 * Get all workflow templates
 */
export function getWorkflowTemplates(): WorkflowTemplate[] {
  return workflowTemplates;
}

/**
 * Get workflow templates by category
 */
export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return workflowTemplates.filter(template => template.category === category);
}

/**
 * Get workflow template by ID
 */
export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find(template => template.id === id);
}

/**
 * Search workflow templates by tag
 */
export function searchTemplatesByTag(tag: string): WorkflowTemplate[] {
  return workflowTemplates.filter(template => 
    template.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(workflowTemplates.map(t => t.category)));
}
