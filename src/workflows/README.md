# Workflow Automation Module

A comprehensive workflow automation system for SimpleCRM that enables automated task execution based on triggers and conditions.

## Overview

This module provides:
- **8 pre-built workflow templates** for common scenarios
- **Flexible workflow builder** for custom automations
- **Comprehensive trigger system** supporting 8+ event types
- **7 action types** for automating tasks
- **Conditional logic** for precise control
- **Execution tracking** and statistics
- **Import/export** capabilities

## Quick Start

```typescript
import { workflowManager, createWorkflow, TriggerType, ActivityType } from './workflows';

// Use a pre-built template
const workflow1 = workflowManager.createFromTemplate(
  'template_deal_won_followup',
  'user123'
);

// Or create a custom workflow
const workflow2 = createWorkflow()
  .setName('My Custom Workflow')
  .setDescription('Automated follow-up for deal changes')
  .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
  .addScheduleActivityAction(
    ActivityType.FOLLOW_UP,
    'Check in with customer',
    'Follow up on deal progress',
    2  // 2 days from now
  )
  .setCreatedBy('user123')
  .buildAndRegister();
```

## Features

### Pre-built Templates

1. **Deal Won Follow-up** - Automate thank you emails and calls
2. **Deal Stage Progression** - Follow-ups when deals move
3. **New Lead Assignment** - Auto-assign and contact new leads
4. **Stale Deal Alert** - Monitor inactive deals
5. **Proposal Follow-up** - Systematic proposal tracking
6. **Meeting Preparation** - Automate meeting prep tasks
7. **Lost Deal Analysis** - Capture feedback and plan future engagement
8. **High-Value Deal Monitoring** - Special handling for large deals

### Trigger Types

- Deal stage changed
- Deal created/won/lost
- Contact created
- Activity completed
- Field updated
- Time-based

### Action Types

- Schedule activities (calls, meetings, follow-ups)
- Send automated emails
- Update field values
- Create tasks
- Assign owners
- Send notifications
- Call webhooks

### Conditional Logic

Add precise conditions to triggers:

```typescript
.addTriggerCondition('value', 'greater_than', 50000)
.addTriggerCondition('stage', 'equals', 'proposal')
.addTriggerCondition('priority', 'not_equals', 'low')
```

## Module Structure

```
workflows/
├── index.ts           # Main exports
├── types.ts           # TypeScript type definitions
├── engine.ts          # Workflow execution engine
├── builder.ts         # Fluent workflow builder API
├── templates.ts       # Pre-built workflow templates
├── manager.ts         # High-level management API
├── examples.ts        # Practical usage examples
└── README.md          # This file
```

## Architecture

### Workflow Engine (`engine.ts`)

Core execution engine that:
- Registers and manages workflows
- Evaluates trigger conditions
- Executes actions sequentially
- Handles errors and tracks status
- Maintains execution history

### Workflow Builder (`builder.ts`)

Fluent API for constructing workflows:
- Chainable methods for easy workflow creation
- Validation of required fields
- Helper methods for common patterns
- Clone and modify existing workflows

### Workflow Manager (`manager.ts`)

High-level API for:
- Creating workflows from templates
- Managing workflow lifecycle
- Importing/exporting workflows
- Viewing execution history and statistics

### Templates (`templates.ts`)

8 pre-built templates covering:
- Deal management
- Lead management
- Sales processes
- Activity management

## Usage Patterns

### Pattern 1: Use a Template

```typescript
const workflow = workflowManager.createFromTemplate(
  'template_new_lead_assignment',
  'user123'
);
```

### Pattern 2: Build Custom Workflow

```typescript
const workflow = createWorkflow()
  .setName('Custom Deal Workflow')
  .setDescription('My custom automation')
  .setTrigger(TriggerType.DEAL_CREATED)
  .addSendNotificationAction('New deal created!')
  .setCreatedBy('user123')
  .buildAndRegister();
```

### Pattern 3: Modify Existing Workflow

```typescript
const existing = workflowManager.getWorkflow('workflow_123');
const builder = WorkflowBuilder.fromWorkflow(existing);

const updated = builder
  .setName('Updated Workflow')
  .addSendEmailAction('new_template', 'New Email')
  .buildAndRegister();
```

### Pattern 4: Conditional Workflows

```typescript
const workflow = createWorkflow()
  .setName('High-Value Deal Workflow')
  .setDescription('Special handling for large deals')
  .setTrigger(TriggerType.DEAL_CREATED)
  .addTriggerCondition('value', 'greater_than', 100000)
  .addTriggerCondition('region', 'equals', 'North America')
  .addSendNotificationAction('🎯 Large NA deal!')
  .addUpdateFieldAction('priority', 'critical')
  .setCreatedBy('sales_manager')
  .buildAndRegister();
```

### Pattern 5: Multi-Action Sequences

```typescript
const workflow = createWorkflow()
  .setName('Onboarding Sequence')
  .setDescription('Complete onboarding automation')
  .setTrigger(TriggerType.DEAL_WON)
  .addSendEmailAction('welcome', 'Welcome!')
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Kickoff call',
    'Initial onboarding call',
    1
  )
  .addCreateTaskAction(
    'Setup account',
    'Create customer account',
    0,
    'onboarding_team'
  )
  .addScheduleActivityAction(
    ActivityType.MEETING,
    '30-day check-in',
    'Customer success check-in',
    30
  )
  .addUpdateFieldAction('customer_status', 'onboarding')
  .setCreatedBy('cs_manager')
  .buildAndRegister();
```

## API Reference

### WorkflowManager

```typescript
// Templates
getTemplates(): WorkflowTemplate[]
getTemplatesByCategory(category: string): WorkflowTemplate[]
searchTemplates(tag: string): WorkflowTemplate[]
getCategories(): string[]

// Workflow CRUD
createFromTemplate(templateId: string, userId: string): Workflow
createCustomWorkflow(): WorkflowBuilder
getWorkflow(id: string): Workflow | undefined
getActiveWorkflows(): Workflow[]
updateWorkflow(id: string, updates: Partial<Workflow>): Workflow
deleteWorkflow(id: string): void

// Activation
activateWorkflow(id: string): Workflow
deactivateWorkflow(id: string): Workflow

// Execution
triggerWorkflows(type: TriggerType, context: any): Promise<WorkflowExecution[]>
getExecutionHistory(workflowId: string): WorkflowExecution[]
getWorkflowStats(workflowId: string): WorkflowStats

// Import/Export
exportWorkflow(id: string): string
importWorkflow(json: string, userId: string): Workflow
```

### WorkflowBuilder

```typescript
// Basic info
setName(name: string): WorkflowBuilder
setDescription(description: string): WorkflowBuilder
setActive(isActive: boolean): WorkflowBuilder
setCreatedBy(userId: string): WorkflowBuilder

// Triggers
setTrigger(type: TriggerType, conditions?, delay?): WorkflowBuilder
addTriggerCondition(field: string, operator: string, value: any): WorkflowBuilder

// Actions
addScheduleActivityAction(...): WorkflowBuilder
addSendEmailAction(...): WorkflowBuilder
addUpdateFieldAction(...): WorkflowBuilder
addCreateTaskAction(...): WorkflowBuilder
addAssignOwnerAction(...): WorkflowBuilder
addSendNotificationAction(...): WorkflowBuilder
addWebhookAction(...): WorkflowBuilder

// Build
build(): Workflow
buildAndRegister(): Workflow
clone(): WorkflowBuilder
```

## Examples

See `examples.ts` for 11 comprehensive examples covering:
1. Complete deal management
2. Lead qualification
3. Customer onboarding
4. Deal risk management
5. Sales manager digests
6. Lead nurturing campaigns
7. Lost deal recovery
8. Proposal tracking
9. Using pre-built templates
10. Workflow management operations
11. Testing workflow execution

## Testing

```typescript
import { testWorkflowExecution } from './examples';

// Run a test workflow
await testWorkflowExecution();
```

## Best Practices

1. **Start with templates** - Modify existing templates before building from scratch
2. **Use specific conditions** - Prevent workflows from firing unnecessarily
3. **Set reasonable delays** - Consider time zones and business hours
4. **Monitor executions** - Check execution history regularly
5. **Name clearly** - Use descriptive names and descriptions
6. **Test thoroughly** - Test with sample data before activating
7. **Avoid circular triggers** - Don't create workflows that trigger each other
8. **Document custom workflows** - Add clear descriptions for team members

## Integration Points

This module integrates with:
- Activity scheduling system
- Email service
- Notification system
- Data layer (for field updates)
- Task management system
- Webhook infrastructure

## Documentation

- **Full Guide**: `docs/workflow-automation.md`
- **Quick Start**: `docs/workflow-automation-quickstart.md`
- **Examples**: `src/workflows/examples.ts`

## Performance

- Asynchronous execution prevents blocking
- Efficient condition evaluation
- Execution history maintained for auditing
- Statistics calculated on-demand
- Supports high-volume triggering

## Future Enhancements

Potential improvements:
- Visual workflow builder UI
- Workflow analytics dashboard
- A/B testing capabilities
- Machine learning optimization
- More pre-built templates
- Advanced scheduling options
- Version control for workflows
- Team collaboration features

## License

Part of SimpleCRM project.
