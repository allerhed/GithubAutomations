# Workflow Automation System

The Workflow Automation System enables users to automate repetitive tasks and streamline their sales processes by creating automated workflows that trigger actions based on specific events.

## Overview

The system provides:
- **Workflow Triggers**: Events that initiate workflows (e.g., deal stage changes, new contacts)
- **Automated Actions**: Tasks that execute automatically (e.g., schedule follow-ups, send emails)
- **Pre-built Templates**: Ready-to-use workflows for common scenarios
- **Custom Builder**: Flexible API for creating custom workflows

## Key Features

### 1. Workflow Triggers

Triggers define when a workflow should execute:

- **Deal Stage Changed**: When a deal moves between pipeline stages
- **Deal Created**: When a new deal is created
- **Deal Won**: When a deal is marked as won
- **Deal Lost**: When a deal is marked as lost
- **Contact Created**: When a new contact is added
- **Activity Completed**: When an activity is marked complete
- **Field Updated**: When a specific field is modified
- **Time-Based**: On a schedule or after a time delay

### 2. Automated Actions

Actions that can be automated:

- **Schedule Activity**: Automatically create follow-ups, calls, meetings, or tasks
- **Send Email**: Send automated emails using templates
- **Update Field**: Modify field values automatically
- **Create Task**: Generate tasks for team members
- **Assign Owner**: Auto-assign deals or contacts to team members
- **Send Notification**: Send in-app notifications
- **Webhook**: Call external APIs for integrations

### 3. Conditional Logic

Add conditions to triggers for precise control:

```typescript
// Only trigger for high-value deals
condition: {
  field: 'value',
  operator: 'greater_than',
  value: 50000
}
```

Supported operators:
- `equals`, `not_equals`
- `contains`
- `greater_than`, `less_than`
- `is_empty`, `is_not_empty`

## Pre-built Templates

The system includes 8 ready-to-use workflow templates:

### Deal Management Templates

1. **Deal Won Follow-up**
   - Sends thank you email when deal is won
   - Schedules thank you call
   - Updates customer status to active

2. **Deal Stage Progression**
   - Schedules follow-up activities when deal moves stages
   - Sends notification to deal owner

3. **Stale Deal Alert**
   - Alerts for deals not updated in 14+ days
   - Schedules re-engagement activities
   - Marks as high priority

4. **High-Value Deal Monitoring**
   - Special tracking for deals over $50,000
   - Immediate notifications and priority setting
   - Schedules strategy meetings

5. **Lost Deal Analysis**
   - Creates tasks to document loss reasons
   - Schedules future follow-up (90 days)
   - Captures lessons learned

### Lead Management Templates

6. **New Lead Auto-Assignment**
   - Automatically assigns new leads to sales reps
   - Schedules initial contact within 24 hours
   - Sends welcome email

### Sales Process Templates

7. **Proposal Sent Follow-up**
   - Schedules follow-up call 2 days after proposal
   - Schedules check-in email after 5 days
   - Sends notifications

### Activity Management Templates

8. **Meeting Preparation**
   - Creates preparation tasks before meetings
   - Generates research tasks
   - Sends meeting confirmation

## Usage Guide

### Using Pre-built Templates

```typescript
import { workflowManager } from './workflows';

// Create a workflow from a template
const workflow = workflowManager.createFromTemplate(
  'template_deal_won_followup',
  'user123'
);

// The workflow is automatically registered and active
console.log(`Created workflow: ${workflow.name}`);
```

### Building Custom Workflows

```typescript
import { createWorkflow, TriggerType, ActivityType } from './workflows';

// Create a custom workflow using the fluent builder API
const customWorkflow = createWorkflow()
  .setName('Deal Stage Change Follow-up')
  .setDescription('Automatically schedule follow-up when deal moves to proposal stage')
  .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
  .addTriggerCondition('newStage', 'equals', 'proposal')
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Follow-up call',
    'Discuss proposal with customer',
    2  // 2 days from now
  )
  .addSendEmailAction('proposal_sent', 'Proposal Sent')
  .setCreatedBy('user123')
  .buildAndRegister();
```

### Triggering Workflows

Workflows are triggered automatically by events in your CRM:

```typescript
import { workflowEngine, TriggerType } from './workflows';

// When a deal stage changes, trigger relevant workflows
await workflowEngine.triggerWorkflows(
  TriggerType.DEAL_STAGE_CHANGED,
  {
    dealId: 'deal123',
    previousStage: 'qualification',
    newStage: 'proposal',
    dealValue: 75000,
    ownerId: 'user456'
  }
);
```

### Managing Workflows

```typescript
import { workflowManager } from './workflows';

// Get all active workflows
const activeWorkflows = workflowManager.getActiveWorkflows();

// Get a specific workflow
const workflow = workflowManager.getWorkflow('workflow_123');

// Update a workflow
const updated = workflowManager.updateWorkflow('workflow_123', {
  name: 'Updated Workflow Name',
  isActive: true
});

// Deactivate a workflow
workflowManager.deactivateWorkflow('workflow_123');

// Delete a workflow
workflowManager.deleteWorkflow('workflow_123');
```

### Viewing Execution History

```typescript
// Get execution history for a workflow
const history = workflowManager.getExecutionHistory('workflow_123');

history.forEach(execution => {
  console.log(`Status: ${execution.status}`);
  console.log(`Triggered: ${execution.triggeredAt}`);
  console.log(`Completed: ${execution.completedAt}`);
});

// Get workflow statistics
const stats = workflowManager.getWorkflowStats('workflow_123');
console.log(`Total executions: ${stats.totalExecutions}`);
console.log(`Success rate: ${stats.successfulExecutions / stats.totalExecutions * 100}%`);
```

## Advanced Examples

### Example 1: Multi-Stage Deal Follow-up

```typescript
const workflow = createWorkflow()
  .setName('Multi-Stage Follow-up')
  .setDescription('Comprehensive follow-up for deal progression')
  .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
  .addScheduleActivityAction(
    ActivityType.FOLLOW_UP,
    'Check deal progress',
    'Follow up on recent stage change',
    3
  )
  .addSendNotificationAction('Deal moved to new stage')
  .addUpdateFieldAction('last_followup_date', new Date().toISOString())
  .setCreatedBy('manager1')
  .buildAndRegister();
```

### Example 2: New Lead Qualification

```typescript
const workflow = createWorkflow()
  .setName('Lead Qualification Process')
  .setDescription('Automated qualification for new leads')
  .setTrigger(TriggerType.CONTACT_CREATED)
  .addTriggerCondition('type', 'equals', 'lead')
  .addTriggerCondition('source', 'equals', 'website')
  .addAssignOwnerAction('sales_rep_1')
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Initial qualification call',
    'Qualify lead and assess fit',
    1
  )
  .addCreateTaskAction(
    'Research company',
    'Research company background before call',
    0
  )
  .addSendEmailAction('lead_welcome', 'Welcome to SimpleCRM')
  .setCreatedBy('marketing_manager')
  .buildAndRegister();
```

### Example 3: Time-Based Deal Review

```typescript
const workflow = createWorkflow()
  .setName('Weekly Deal Review')
  .setDescription('Review deals not updated in 7 days')
  .setTrigger(TriggerType.TIME_BASED)
  .addTriggerCondition('days_since_update', 'greater_than', 7)
  .addTriggerCondition('stage', 'not_equals', 'won')
  .addSendNotificationAction('Deal needs attention - no updates in 7 days')
  .addScheduleActivityAction(
    ActivityType.FOLLOW_UP,
    'Re-engage with deal',
    'Contact customer to move deal forward',
    1
  )
  .setCreatedBy('sales_manager')
  .buildAndRegister();
```

### Example 4: Import/Export Workflows

```typescript
// Export a workflow for backup or sharing
const json = workflowManager.exportWorkflow('workflow_123');
console.log(json);

// Import a workflow
const imported = workflowManager.importWorkflow(json, 'user123');
console.log(`Imported workflow: ${imported.id}`);
```

## Template Categories

Browse templates by category:

```typescript
// Get all categories
const categories = workflowManager.getCategories();
// Returns: ['Deal Management', 'Lead Management', 'Sales Process', 'Activity Management']

// Get templates in a category
const dealTemplates = workflowManager.getTemplatesByCategory('Deal Management');

// Search templates by tag
const followupTemplates = workflowManager.searchTemplates('follow-up');
```

## Best Practices

1. **Start with Templates**: Use pre-built templates as a starting point
2. **Test Conditions**: Verify trigger conditions match your data structure
3. **Monitor Executions**: Regularly review execution history and statistics
4. **Avoid Circular Triggers**: Be careful not to create workflows that trigger each other
5. **Use Specific Conditions**: Add conditions to prevent workflows from firing unnecessarily
6. **Document Custom Workflows**: Add clear names and descriptions
7. **Set Time Delays Appropriately**: Consider time zones and business hours
8. **Review and Refine**: Regularly review workflow performance and adjust

## Integration Points

The workflow system integrates with:

- **Activity Scheduler**: For creating and scheduling activities
- **Email System**: For sending automated emails
- **Notification System**: For in-app notifications
- **Data Layer**: For updating fields and entities
- **Webhook System**: For external integrations
- **Task Manager**: For creating tasks

## Error Handling

Workflows include robust error handling:

```typescript
// Executions track success and failure
const execution = {
  status: 'failed',
  error: 'Email service unavailable'
};

// Check failed executions
const history = workflowManager.getExecutionHistory('workflow_123');
const failed = history.filter(e => e.status === 'failed');

failed.forEach(exec => {
  console.error(`Execution ${exec.id} failed: ${exec.error}`);
});
```

## Performance Considerations

- Workflows execute asynchronously to avoid blocking
- Time delays are handled efficiently
- Execution history is maintained for auditing
- Statistics are calculated on-demand

## Future Enhancements

Potential future improvements:

- Visual workflow builder UI
- A/B testing for workflows
- Workflow analytics and insights
- Machine learning for optimization
- More pre-built templates
- Advanced scheduling options
- Workflow version control
- Team collaboration features

## Support

For questions or issues with workflow automation:
1. Review this documentation
2. Check execution history for errors
3. Verify trigger conditions
4. Test with simple workflows first
5. Consult with your system administrator
