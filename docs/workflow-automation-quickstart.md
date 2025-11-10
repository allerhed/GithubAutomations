# Workflow Automation Quick Start Guide

Get started with workflow automation in 5 minutes!

## What are Workflow Automations?

Workflow automations reduce manual work by automatically performing tasks when specific events occur. For example:
- Send a follow-up email when a deal reaches the proposal stage
- Assign new leads to sales reps automatically
- Schedule calls when deals move between stages
- Alert managers about high-value deals

## Quick Start

### Step 1: Use a Pre-built Template

The easiest way to get started is with a pre-built template:

```typescript
import { workflowManager } from '@/workflows';

// Create a workflow from a template
const workflow = workflowManager.createFromTemplate(
  'template_deal_won_followup',  // Template ID
  'user123'                       // Your user ID
);

console.log(`✓ Workflow "${workflow.name}" is now active!`);
```

### Step 2: View Available Templates

See all available templates:

```typescript
// Get all templates
const templates = workflowManager.getTemplates();

templates.forEach(template => {
  console.log(`${template.name}`);
  console.log(`  ${template.description}`);
  console.log(`  Category: ${template.category}`);
  console.log('');
});
```

Common templates:
- `template_deal_won_followup` - Thank you emails and calls for won deals
- `template_new_lead_assignment` - Auto-assign and contact new leads
- `template_stage_progression` - Follow-ups when deals move stages
- `template_stale_deal_alert` - Alerts for inactive deals
- `template_high_value_deal` - Special handling for big opportunities

### Step 3: Create Your First Custom Workflow

Build a simple custom workflow:

```typescript
import { createWorkflow, TriggerType, ActivityType } from '@/workflows';

const workflow = createWorkflow()
  .setName('My First Workflow')
  .setDescription('Send email when deal stage changes')
  .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
  .addSendEmailAction('stage_change_notification', 'Deal Stage Updated')
  .setCreatedBy('user123')
  .buildAndRegister();

console.log(`✓ Custom workflow created: ${workflow.id}`);
```

## Common Use Cases

### Scenario 1: Automatic Follow-ups

When a deal moves to "Proposal Sent", schedule a follow-up call:

```typescript
createWorkflow()
  .setName('Proposal Follow-up')
  .setDescription('Schedule call after sending proposal')
  .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
  .addTriggerCondition('newStage', 'equals', 'proposal_sent')
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Proposal follow-up',
    'Check if customer has questions about proposal',
    2  // Schedule 2 days from now
  )
  .setCreatedBy('user123')
  .buildAndRegister();
```

### Scenario 2: New Lead Assignment

Automatically assign new leads from your website:

```typescript
createWorkflow()
  .setName('Website Lead Assignment')
  .setDescription('Auto-assign leads from website forms')
  .setTrigger(TriggerType.CONTACT_CREATED)
  .addTriggerCondition('source', 'equals', 'website')
  .addAssignOwnerAction('sales_rep_1')
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Initial contact',
    'Call new lead within 24 hours',
    1
  )
  .addSendEmailAction('welcome_email', 'Welcome!')
  .setCreatedBy('user123')
  .buildAndRegister();
```

### Scenario 3: High-Value Deal Alerts

Get notified immediately for large deals:

```typescript
createWorkflow()
  .setName('Large Deal Alert')
  .setDescription('Alert team for deals over $100k')
  .setTrigger(TriggerType.DEAL_CREATED)
  .addTriggerCondition('value', 'greater_than', 100000)
  .addSendNotificationAction('🎯 High-value deal created! Review immediately.')
  .addUpdateFieldAction('priority', 'high')
  .setCreatedBy('user123')
  .buildAndRegister();
```

### Scenario 4: Stale Deal Reminders

Remind reps about inactive deals:

```typescript
createWorkflow()
  .setName('Inactive Deal Reminder')
  .setDescription('Alert for deals not updated in 2 weeks')
  .setTrigger(TriggerType.TIME_BASED)
  .addTriggerCondition('days_since_update', 'greater_than', 14)
  .addTriggerCondition('stage', 'not_equals', 'won')
  .addTriggerCondition('stage', 'not_equals', 'lost')
  .addSendNotificationAction('This deal needs attention!')
  .addScheduleActivityAction(
    ActivityType.FOLLOW_UP,
    'Re-engage',
    'Contact customer to move deal forward',
    1
  )
  .setCreatedBy('user123')
  .buildAndRegister();
```

## Managing Your Workflows

### View Active Workflows

```typescript
const workflows = workflowManager.getActiveWorkflows();
console.log(`You have ${workflows.length} active workflows`);
```

### Pause a Workflow

```typescript
workflowManager.deactivateWorkflow('workflow_123');
console.log('✓ Workflow paused');
```

### Resume a Workflow

```typescript
workflowManager.activateWorkflow('workflow_123');
console.log('✓ Workflow resumed');
```

### View Execution History

```typescript
const history = workflowManager.getExecutionHistory('workflow_123');
console.log(`This workflow has run ${history.length} times`);

// See recent executions
history.slice(0, 5).forEach(exec => {
  console.log(`${exec.triggeredAt}: ${exec.status}`);
});
```

### Get Performance Statistics

```typescript
const stats = workflowManager.getWorkflowStats('workflow_123');
console.log(`Success rate: ${
  (stats.successfulExecutions / stats.totalExecutions * 100).toFixed(1)
}%`);
```

## Workflow Builder Methods

Complete reference for building workflows:

### Setting Basic Info
- `.setName(name)` - Workflow name
- `.setDescription(description)` - Workflow description
- `.setActive(true/false)` - Enable or disable
- `.setCreatedBy(userId)` - Set creator

### Setting Triggers
- `.setTrigger(type, conditions?, delay?)` - Set the trigger event
- `.addTriggerCondition(field, operator, value)` - Add conditions

### Adding Actions
- `.addScheduleActivityAction(type, subject, description, dueDate, assignTo?)` - Schedule activities
- `.addSendEmailAction(template, subject, to?)` - Send emails
- `.addUpdateFieldAction(field, value)` - Update fields
- `.addCreateTaskAction(subject, description, dueDate, assignTo?)` - Create tasks
- `.addAssignOwnerAction(userId)` - Assign ownership
- `.addSendNotificationAction(message, to?)` - Send notifications
- `.addWebhookAction(url)` - Call webhooks

### Finalizing
- `.build()` - Build workflow object
- `.buildAndRegister()` - Build and activate immediately

## Trigger Types

Available trigger events:

- `TriggerType.DEAL_STAGE_CHANGED` - Deal moves between stages
- `TriggerType.DEAL_CREATED` - New deal created
- `TriggerType.DEAL_WON` - Deal marked as won
- `TriggerType.DEAL_LOST` - Deal marked as lost
- `TriggerType.CONTACT_CREATED` - New contact added
- `TriggerType.ACTIVITY_COMPLETED` - Activity marked complete
- `TriggerType.FIELD_UPDATED` - Field value changed
- `TriggerType.TIME_BASED` - Scheduled or time-based

## Activity Types

Types of activities you can schedule:

- `ActivityType.CALL` - Phone call
- `ActivityType.EMAIL` - Email task
- `ActivityType.MEETING` - Meeting
- `ActivityType.FOLLOW_UP` - General follow-up
- `ActivityType.TASK` - Custom task

## Condition Operators

Operators for trigger conditions:

- `equals` - Exact match
- `not_equals` - Does not match
- `contains` - Contains substring
- `greater_than` - Numeric comparison
- `less_than` - Numeric comparison
- `is_empty` - Field is empty or null
- `is_not_empty` - Field has a value

## Tips & Best Practices

1. **Start Simple**: Begin with one action, then add more
2. **Use Templates**: Modify existing templates instead of starting from scratch
3. **Test Conditions**: Make sure conditions match your data
4. **Set Reasonable Delays**: Consider business hours and time zones
5. **Monitor Performance**: Check execution history regularly
6. **Name Clearly**: Use descriptive names for easy management
7. **Document Purpose**: Add clear descriptions
8. **Avoid Loops**: Don't create workflows that trigger each other

## Troubleshooting

### Workflow Not Triggering?
- Check if workflow is active: `workflow.isActive`
- Verify trigger conditions match your data
- Check execution history for errors

### Actions Not Working?
- Review execution history: `getExecutionHistory(id)`
- Check for error messages in failed executions
- Verify configuration values are correct

### Too Many Executions?
- Add more specific trigger conditions
- Consider using time delays
- Temporarily deactivate while adjusting

## Next Steps

Now that you're familiar with the basics:

1. **Browse Templates**: Review all 8 pre-built templates
2. **Create Custom Workflows**: Build workflows for your specific needs
3. **Monitor Performance**: Track execution statistics
4. **Read Full Documentation**: See [Workflow Automation Guide](./workflow-automation.md)
5. **Share with Team**: Help teammates set up their workflows

## Need Help?

- Full documentation: `docs/workflow-automation.md`
- Template examples: `src/workflows/templates.ts`
- Builder examples: `src/workflows/builder.ts`

Happy automating! 🚀
