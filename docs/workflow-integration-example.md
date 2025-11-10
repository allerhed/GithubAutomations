# Workflow Automation Integration Example

This example demonstrates a complete integration of the workflow automation system in a CRM application.

## Scenario: Complete Sales Pipeline Automation

This example shows how to set up automated workflows for a complete sales pipeline.

## Step 1: Initialize the System

```typescript
import {
  workflowManager,
  createWorkflow,
  TriggerType,
  ActionType,
  ActivityType,
} from './src/workflows';

console.log('Initializing Workflow Automation System...');
```

## Step 2: Setup Lead Management Workflows

```typescript
// Workflow 1: Auto-assign new website leads
const leadAssignment = createWorkflow()
  .setName('Website Lead Assignment')
  .setDescription('Automatically assign and contact website leads')
  .setTrigger(TriggerType.CONTACT_CREATED)
  .addTriggerCondition('source', 'equals', 'website')
  .addTriggerCondition('type', 'equals', 'lead')
  .addAssignOwnerAction('sales_team_queue')
  .addSendEmailAction('lead_welcome', 'Welcome! We received your inquiry')
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Initial contact call',
    'Call lead within 1 hour to qualify',
    0  // Immediate
  )
  .addUpdateFieldAction('lead_status', 'contacted')
  .setCreatedBy('marketing_ops')
  .buildAndRegister();

console.log('✓ Lead assignment workflow active');
```

## Step 3: Setup Deal Pipeline Workflows

```typescript
// Workflow 2: Deal stage progression
const stageProgression = createWorkflow()
  .setName('Deal Stage Automation')
  .setDescription('Automated actions when deals move through pipeline')
  .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
  .addScheduleActivityAction(
    ActivityType.FOLLOW_UP,
    'Stage transition follow-up',
    'Check in with customer about next steps',
    2
  )
  .addSendNotificationAction('Deal moved to new stage - review and act')
  .addUpdateFieldAction('last_stage_change_date', new Date().toISOString())
  .setCreatedBy('sales_ops')
  .buildAndRegister();

console.log('✓ Deal stage progression workflow active');

// Workflow 3: Proposal automation
const proposalWorkflow = createWorkflow()
  .setName('Proposal Tracking')
  .setDescription('Automated follow-up after sending proposals')
  .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
  .addTriggerCondition('newStage', 'equals', 'proposal_sent')
  .addSendEmailAction('proposal_confirmation', 'Proposal Sent - Next Steps')
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Proposal follow-up',
    'Call to ensure proposal received and answer questions',
    1
  )
  .addScheduleActivityAction(
    ActivityType.EMAIL,
    'Proposal check-in',
    'Email to check on proposal status',
    3
  )
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Decision timeline call',
    'Call to understand decision process and timeline',
    7
  )
  .addUpdateFieldAction('proposal_sent_date', new Date().toISOString())
  .setCreatedBy('sales_ops')
  .buildAndRegister();

console.log('✓ Proposal tracking workflow active');
```

## Step 4: Setup Customer Success Workflows

```typescript
// Workflow 4: Won deal onboarding
const onboarding = workflowManager.createFromTemplate(
  'template_deal_won_followup',
  'customer_success'
);

console.log('✓ Customer onboarding workflow active');

// Workflow 5: Enhanced onboarding
const enhancedOnboarding = createWorkflow()
  .setName('Complete Customer Onboarding')
  .setDescription('Comprehensive onboarding process')
  .setTrigger(TriggerType.DEAL_WON)
  .addTriggerCondition('value', 'greater_than', 10000)
  .addSendEmailAction('premium_welcome', 'Welcome to Premium Service')
  .addScheduleActivityAction(
    ActivityType.MEETING,
    'Onboarding kickoff',
    'Initial onboarding and setup meeting',
    1
  )
  .addCreateTaskAction(
    'Setup premium account',
    'Configure premium features and integrations',
    0,
    'onboarding_specialist'
  )
  .addScheduleActivityAction(
    ActivityType.CALL,
    '1-week check-in',
    'Check on initial experience',
    7
  )
  .addScheduleActivityAction(
    ActivityType.MEETING,
    '30-day success review',
    'Review progress and identify optimization opportunities',
    30
  )
  .addUpdateFieldAction('customer_tier', 'premium')
  .setCreatedBy('customer_success')
  .buildAndRegister();

console.log('✓ Enhanced onboarding workflow active');
```

## Step 5: Setup Risk Management Workflows

```typescript
// Workflow 6: Stale deal monitoring
const staleDeals = workflowManager.createFromTemplate(
  'template_stale_deal_alert',
  'sales_manager'
);

console.log('✓ Stale deal monitoring active');

// Workflow 7: High-value deal tracking
const highValueDeals = createWorkflow()
  .setName('Enterprise Deal Management')
  .setDescription('Special handling for enterprise deals')
  .setTrigger(TriggerType.DEAL_CREATED)
  .addTriggerCondition('value', 'greater_than', 100000)
  .addSendNotificationAction(
    '🎯 Enterprise deal created! Immediate attention required.',
    'sales_director'
  )
  .addUpdateFieldAction('priority', 'critical')
  .addUpdateFieldAction('deal_tier', 'enterprise')
  .addScheduleActivityAction(
    ActivityType.MEETING,
    'Enterprise strategy meeting',
    'Plan approach and resources for enterprise deal',
    0
  )
  .addCreateTaskAction(
    'Enterprise deal research',
    'Comprehensive research on company, stakeholders, and requirements',
    0,
    'deal_strategist'
  )
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Executive sponsor call',
    'Engage executive sponsor for relationship building',
    2
  )
  .setCreatedBy('sales_director')
  .buildAndRegister();

console.log('✓ Enterprise deal tracking active');
```

## Step 6: Setup Lost Deal Recovery

```typescript
// Workflow 8: Lost deal follow-up
const lostDealRecovery = createWorkflow()
  .setName('Lost Deal Recovery Program')
  .setDescription('Long-term engagement for lost opportunities')
  .setTrigger(TriggerType.DEAL_LOST)
  .addTriggerCondition('loss_reason', 'not_equals', 'bad_fit')
  .addCreateTaskAction(
    'Document loss analysis',
    'Document loss reasons, competitor info, and lessons learned',
    0
  )
  .addScheduleActivityAction(
    ActivityType.EMAIL,
    '30-day check-in',
    'Touch base to see if anything has changed',
    30
  )
  .addScheduleActivityAction(
    ActivityType.CALL,
    'Quarterly follow-up',
    'Check on potential new opportunities',
    90
  )
  .addScheduleActivityAction(
    ActivityType.EMAIL,
    '6-month re-engagement',
    'Share new features or case studies',
    180
  )
  .addUpdateFieldAction('recovery_program', 'active')
  .setCreatedBy('sales_ops')
  .buildAndRegister();

console.log('✓ Lost deal recovery program active');
```

## Step 7: Monitor and Manage

```typescript
// Get all active workflows
const activeWorkflows = workflowManager.getActiveWorkflows();
console.log(`\nActive workflows: ${activeWorkflows.length}`);

activeWorkflows.forEach(workflow => {
  console.log(`  - ${workflow.name}`);
  
  // Get statistics for each workflow
  const stats = workflowManager.getWorkflowStats(workflow.id);
  console.log(`    Executions: ${stats.totalExecutions}`);
  console.log(`    Success rate: ${
    stats.totalExecutions > 0 
      ? (stats.successfulExecutions / stats.totalExecutions * 100).toFixed(1)
      : 0
  }%`);
});
```

## Step 8: Trigger Workflows in Your Application

```typescript
// Example: When a new lead is created via web form
async function handleNewWebLead(leadData) {
  // Create the contact in your system
  const contact = await createContact({
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    source: 'website',
    type: 'lead',
  });
  
  // Trigger workflows
  const executions = await workflowManager.triggerWorkflows(
    TriggerType.CONTACT_CREATED,
    {
      contactId: contact.id,
      source: 'website',
      type: 'lead',
      name: contact.name,
      email: contact.email,
    }
  );
  
  console.log(`Triggered ${executions.length} workflow(s) for new lead`);
  return contact;
}

// Example: When a deal stage changes
async function handleDealStageChange(deal, oldStage, newStage) {
  // Update deal in your system
  await updateDeal(deal.id, { stage: newStage });
  
  // Trigger workflows
  const executions = await workflowManager.triggerWorkflows(
    TriggerType.DEAL_STAGE_CHANGED,
    {
      dealId: deal.id,
      previousStage: oldStage,
      newStage: newStage,
      dealValue: deal.value,
      ownerId: deal.ownerId,
      companyName: deal.companyName,
    }
  );
  
  console.log(`Triggered ${executions.length} workflow(s) for stage change`);
}

// Example: When a deal is won
async function handleDealWon(deal) {
  // Mark deal as won in your system
  await updateDeal(deal.id, { 
    stage: 'won',
    closeDate: new Date(),
  });
  
  // Trigger workflows
  const executions = await workflowManager.triggerWorkflows(
    TriggerType.DEAL_WON,
    {
      dealId: deal.id,
      dealValue: deal.value,
      customerId: deal.customerId,
      ownerId: deal.ownerId,
      closeDate: new Date().toISOString(),
    }
  );
  
  console.log(`Triggered ${executions.length} workflow(s) for won deal`);
}
```

## Step 9: Export Workflows for Backup

```typescript
// Export all workflows
console.log('\nBacking up workflows...');
const allWorkflows = workflowManager.getActiveWorkflows();

const backup = {
  exportDate: new Date().toISOString(),
  workflows: allWorkflows.map(w => {
    return JSON.parse(workflowManager.exportWorkflow(w.id));
  }),
};

// Save to file or database
const backupJson = JSON.stringify(backup, null, 2);
console.log(`✓ Backed up ${allWorkflows.length} workflows`);
```

## Complete Setup Summary

```typescript
console.log('\n=== Workflow Automation Setup Complete ===');
console.log('\nActive Automations:');
console.log('  Lead Management:');
console.log('    ✓ Website lead auto-assignment');
console.log('  Deal Pipeline:');
console.log('    ✓ Deal stage progression');
console.log('    ✓ Proposal tracking and follow-up');
console.log('  Customer Success:');
console.log('    ✓ Standard onboarding');
console.log('    ✓ Premium customer onboarding');
console.log('  Risk Management:');
console.log('    ✓ Stale deal monitoring');
console.log('    ✓ Enterprise deal tracking');
console.log('  Recovery:');
console.log('    ✓ Lost deal recovery program');
console.log('\nYour sales team can now focus on selling!');
```

## Benefits Achieved

With this setup:

1. **New leads** are automatically assigned and contacted within 1 hour
2. **Deal progression** triggers appropriate follow-up actions
3. **Proposals** have systematic follow-up sequences
4. **Won deals** enter structured onboarding
5. **Premium customers** get enhanced onboarding
6. **Stale deals** are proactively identified
7. **Enterprise deals** get executive attention
8. **Lost deals** are nurtured for future opportunities

## Monitoring Dashboard (Pseudo-code)

```typescript
function displayWorkflowDashboard() {
  const workflows = workflowManager.getActiveWorkflows();
  
  console.log('\n=== Workflow Dashboard ===\n');
  
  workflows.forEach(workflow => {
    const stats = workflowManager.getWorkflowStats(workflow.id);
    const history = workflowManager.getExecutionHistory(workflow.id);
    
    console.log(`${workflow.name}`);
    console.log(`  Status: ${workflow.isActive ? 'Active' : 'Inactive'}`);
    console.log(`  Total Executions: ${stats.totalExecutions}`);
    console.log(`  Successful: ${stats.successfulExecutions}`);
    console.log(`  Failed: ${stats.failedExecutions}`);
    console.log(`  Success Rate: ${
      (stats.successfulExecutions / stats.totalExecutions * 100).toFixed(1)
    }%`);
    console.log(`  Avg Execution Time: ${stats.averageExecutionTime}ms`);
    
    // Recent executions
    const recent = history.slice(0, 3);
    if (recent.length > 0) {
      console.log(`  Recent Executions:`);
      recent.forEach(exec => {
        console.log(`    - ${exec.triggeredAt}: ${exec.status}`);
      });
    }
    console.log('');
  });
}
```

## Next Steps

1. Monitor workflow execution in your application logs
2. Review statistics regularly to optimize workflows
3. Add custom workflows for your specific business needs
4. Train your team on workflow management
5. Iterate and improve based on results

The Workflow Automation system is now managing your entire sales process automatically!
