/**
 * Workflow Automation Examples
 * 
 * Practical examples demonstrating various workflow automation scenarios
 */

import {
  createWorkflow,
  workflowManager,
  TriggerType,
  ActionType,
  ActivityType,
} from './index';

/**
 * Example 1: Complete Deal Management Workflow
 * 
 * Comprehensive workflow for managing deals through the entire pipeline
 */
export function createCompleteDealWorkflow() {
  const workflow = createWorkflow()
    .setName('Complete Deal Pipeline Management')
    .setDescription('Automated actions for every deal stage transition')
    .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
    .addScheduleActivityAction(
      ActivityType.FOLLOW_UP,
      'Stage transition follow-up',
      'Check in with customer about recent progress',
      2
    )
    .addSendNotificationAction(
      'Deal moved to new stage. Review and take appropriate action.'
    )
    .addUpdateFieldAction('last_stage_change', new Date().toISOString())
    .setCreatedBy('system')
    .buildAndRegister();

  console.log('✓ Complete deal workflow created:', workflow.id);
  return workflow;
}

/**
 * Example 2: Lead Qualification Workflow
 * 
 * Automate the lead qualification process
 */
export function createLeadQualificationWorkflow() {
  const workflow = createWorkflow()
    .setName('Lead Qualification Automation')
    .setDescription('Automatically qualify and route new leads')
    .setTrigger(TriggerType.CONTACT_CREATED)
    .addTriggerCondition('type', 'equals', 'lead')
    .addTriggerCondition('source', 'not_equals', 'cold_call')
    .addAssignOwnerAction('lead_qualifier_bot')
    .addScheduleActivityAction(
      ActivityType.CALL,
      'Qualification call',
      'Initial qualification - verify fit and interest level',
      1
    )
    .addCreateTaskAction(
      'Lead research',
      'Research company background, industry, and potential fit',
      0,
      'lead_researcher'
    )
    .addSendEmailAction('lead_qualification_intro', 'Let\'s connect')
    .addUpdateFieldAction('qualification_status', 'in_progress')
    .setCreatedBy('system')
    .buildAndRegister();

  console.log('✓ Lead qualification workflow created:', workflow.id);
  return workflow;
}

/**
 * Example 3: Customer Onboarding Workflow
 * 
 * Automate customer onboarding when deals are won
 */
export function createCustomerOnboardingWorkflow() {
  const workflow = createWorkflow()
    .setName('Customer Onboarding Process')
    .setDescription('Automated onboarding steps for new customers')
    .setTrigger(TriggerType.DEAL_WON)
    .addSendEmailAction('customer_welcome', 'Welcome to our service!')
    .addScheduleActivityAction(
      ActivityType.CALL,
      'Onboarding kickoff call',
      'Schedule and conduct initial onboarding call',
      1
    )
    .addCreateTaskAction(
      'Setup customer account',
      'Create customer account in system with appropriate access',
      0,
      'onboarding_team'
    )
    .addCreateTaskAction(
      'Send onboarding materials',
      'Email welcome packet, user guides, and training schedule',
      1,
      'onboarding_team'
    )
    .addScheduleActivityAction(
      ActivityType.MEETING,
      '30-day check-in',
      'Schedule 30-day check-in meeting to ensure customer success',
      30
    )
    .addUpdateFieldAction('customer_status', 'onboarding')
    .addUpdateFieldAction('onboarding_start_date', new Date().toISOString())
    .addSendNotificationAction('New customer won! Onboarding process initiated.', 'onboarding_manager')
    .setCreatedBy('system')
    .buildAndRegister();

  console.log('✓ Customer onboarding workflow created:', workflow.id);
  return workflow;
}

/**
 * Example 4: Deal Risk Management Workflow
 * 
 * Monitor and manage at-risk deals
 */
export function createDealRiskManagementWorkflow() {
  const workflow = createWorkflow()
    .setName('At-Risk Deal Management')
    .setDescription('Proactive management of deals at risk of being lost')
    .setTrigger(TriggerType.TIME_BASED)
    .addTriggerCondition('days_since_update', 'greater_than', 10)
    .addTriggerCondition('days_until_close', 'less_than', 30)
    .addTriggerCondition('stage', 'not_equals', 'won')
    .addTriggerCondition('stage', 'not_equals', 'lost')
    .addTriggerCondition('probability', 'less_than', 50)
    .addUpdateFieldAction('risk_level', 'high')
    .addSendNotificationAction(
      '⚠️ Deal at risk! No updates in 10+ days with close date approaching.',
      'sales_manager'
    )
    .addScheduleActivityAction(
      ActivityType.CALL,
      'URGENT: Risk mitigation call',
      'Immediate call to assess situation and create action plan',
      0
    )
    .addCreateTaskAction(
      'Risk assessment',
      'Document risk factors and create mitigation strategy',
      0,
      'deal_owner'
    )
    .setCreatedBy('system')
    .buildAndRegister();

  console.log('✓ Deal risk management workflow created:', workflow.id);
  return workflow;
}

/**
 * Example 5: Sales Manager Digest Workflow
 * 
 * Daily digest of important sales activities
 */
export function createSalesManagerDigestWorkflow() {
  const workflow = createWorkflow()
    .setName('Sales Manager Daily Digest')
    .setDescription('Daily summary of critical sales activities')
    .setTrigger(TriggerType.TIME_BASED)
    .addSendEmailAction('manager_daily_digest', 'Your Daily Sales Digest')
    .addSendNotificationAction('Daily sales digest sent to your email.')
    .setCreatedBy('system')
    .buildAndRegister();

  console.log('✓ Sales manager digest workflow created:', workflow.id);
  return workflow;
}

/**
 * Example 6: Multi-Touch Lead Nurturing
 * 
 * Sequence of touches for lead nurturing
 */
export function createLeadNurturingWorkflow() {
  const workflow = createWorkflow()
    .setName('Lead Nurturing Campaign')
    .setDescription('Multi-touch campaign for new leads')
    .setTrigger(TriggerType.CONTACT_CREATED)
    .addTriggerCondition('type', 'equals', 'lead')
    .addTriggerCondition('status', 'equals', 'new')
    .addSendEmailAction('nurture_email_1', 'Welcome to SimpleCRM')
    .addScheduleActivityAction(
      ActivityType.EMAIL,
      'Nurture Email 2',
      'Send second nurture email',
      3
    )
    .addScheduleActivityAction(
      ActivityType.EMAIL,
      'Nurture Email 3',
      'Send third nurture email with case study',
      7
    )
    .addScheduleActivityAction(
      ActivityType.CALL,
      'Nurture call',
      'Call to assess interest and schedule demo',
      10
    )
    .addUpdateFieldAction('nurture_campaign', 'active')
    .setCreatedBy('marketing')
    .buildAndRegister();

  console.log('✓ Lead nurturing workflow created:', workflow.id);
  return workflow;
}

/**
 * Example 7: Lost Deal Recovery Workflow
 * 
 * Long-term follow-up for lost deals
 */
export function createLostDealRecoveryWorkflow() {
  const workflow = createWorkflow()
    .setName('Lost Deal Recovery')
    .setDescription('Follow-up system for lost deals')
    .setTrigger(TriggerType.DEAL_LOST)
    .addTriggerCondition('loss_reason', 'not_equals', 'bad_fit')
    .addCreateTaskAction(
      'Document loss details',
      'Document loss reason, competitor information, and lessons learned',
      0
    )
    .addScheduleActivityAction(
      ActivityType.EMAIL,
      '30-day check-in',
      'Send check-in email to see if situation has changed',
      30
    )
    .addScheduleActivityAction(
      ActivityType.CALL,
      '90-day follow-up',
      'Call to discuss any new opportunities',
      90
    )
    .addScheduleActivityAction(
      ActivityType.EMAIL,
      '6-month re-engagement',
      'Send email about new features or offerings',
      180
    )
    .addUpdateFieldAction('recovery_campaign', 'active')
    .setCreatedBy('system')
    .buildAndRegister();

  console.log('✓ Lost deal recovery workflow created:', workflow.id);
  return workflow;
}

/**
 * Example 8: Proposal Tracking Workflow
 * 
 * Track and follow up on proposals
 */
export function createProposalTrackingWorkflow() {
  const workflow = createWorkflow()
    .setName('Proposal Tracking & Follow-up')
    .setDescription('Systematic follow-up after sending proposals')
    .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
    .addTriggerCondition('newStage', 'equals', 'proposal_sent')
    .addSendEmailAction('proposal_sent_confirmation', 'Proposal Sent')
    .addScheduleActivityAction(
      ActivityType.CALL,
      'Proposal receipt confirmation',
      'Call to confirm proposal received and answer initial questions',
      1
    )
    .addScheduleActivityAction(
      ActivityType.EMAIL,
      'Proposal follow-up email',
      'Email to check on questions and next steps',
      3
    )
    .addScheduleActivityAction(
      ActivityType.CALL,
      'Decision timeline call',
      'Call to understand decision timeline and address concerns',
      7
    )
    .addUpdateFieldAction('proposal_sent_date', new Date().toISOString())
    .addSendNotificationAction('Proposal sent - follow-up sequence initiated')
    .setCreatedBy('sales')
    .buildAndRegister();

  console.log('✓ Proposal tracking workflow created:', workflow.id);
  return workflow;
}

/**
 * Example 9: Using Pre-built Templates
 * 
 * Demonstrates how to use pre-built templates
 */
export function usePrebuiltTemplates() {
  console.log('Available workflow templates:');
  
  // Get all templates
  const templates = workflowManager.getTemplates();
  templates.forEach(template => {
    console.log(`- ${template.name} (${template.category})`);
  });

  // Create workflows from templates
  const workflows = [
    workflowManager.createFromTemplate('template_deal_won_followup', 'user123'),
    workflowManager.createFromTemplate('template_new_lead_assignment', 'user123'),
    workflowManager.createFromTemplate('template_stale_deal_alert', 'user123'),
  ];

  console.log(`\n✓ Created ${workflows.length} workflows from templates`);
  return workflows;
}

/**
 * Example 10: Workflow Management
 * 
 * Demonstrates workflow management operations
 */
export function demonstrateWorkflowManagement() {
  // Create a test workflow
  const workflow = createWorkflow()
    .setName('Test Workflow')
    .setDescription('For demonstration purposes')
    .setTrigger(TriggerType.DEAL_CREATED)
    .addSendNotificationAction('New deal created')
    .setCreatedBy('demo_user')
    .buildAndRegister();

  console.log('Created workflow:', workflow.id);

  // Get all active workflows
  const active = workflowManager.getActiveWorkflows();
  console.log(`Active workflows: ${active.length}`);

  // Update workflow
  const updated = workflowManager.updateWorkflow(workflow.id, {
    name: 'Updated Test Workflow',
    description: 'Updated description',
  });
  console.log('Updated workflow:', updated.name);

  // Deactivate workflow
  workflowManager.deactivateWorkflow(workflow.id);
  console.log('Workflow deactivated');

  // Reactivate workflow
  workflowManager.activateWorkflow(workflow.id);
  console.log('Workflow reactivated');

  // Export workflow
  const json = workflowManager.exportWorkflow(workflow.id);
  console.log('Workflow exported:', json.substring(0, 100) + '...');

  // Get statistics
  const stats = workflowManager.getWorkflowStats(workflow.id);
  console.log('Workflow stats:', stats);

  // Clean up
  workflowManager.deleteWorkflow(workflow.id);
  console.log('Workflow deleted');
}

/**
 * Example 11: Testing Workflow Execution
 * 
 * Demonstrates triggering and monitoring workflows
 */
export async function testWorkflowExecution() {
  // Create a simple test workflow
  const workflow = createWorkflow()
    .setName('Test Execution Workflow')
    .setDescription('Testing workflow execution')
    .setTrigger(TriggerType.DEAL_CREATED)
    .addTriggerCondition('value', 'greater_than', 1000)
    .addSendNotificationAction('Test notification')
    .setCreatedBy('test_user')
    .buildAndRegister();

  // Trigger the workflow
  const executions = await workflowManager.triggerWorkflows(
    TriggerType.DEAL_CREATED,
    {
      dealId: 'deal_test_123',
      value: 5000,
      name: 'Test Deal',
      stage: 'qualification',
    }
  );

  console.log(`Triggered ${executions.length} workflow(s)`);

  // Get execution history
  const history = workflowManager.getExecutionHistory(workflow.id);
  console.log('Execution history:', history);

  // Clean up
  workflowManager.deleteWorkflow(workflow.id);
}

// Run all examples
export function runAllExamples() {
  console.log('=== Workflow Automation Examples ===\n');
  
  console.log('1. Complete Deal Management');
  createCompleteDealWorkflow();
  
  console.log('\n2. Lead Qualification');
  createLeadQualificationWorkflow();
  
  console.log('\n3. Customer Onboarding');
  createCustomerOnboardingWorkflow();
  
  console.log('\n4. Deal Risk Management');
  createDealRiskManagementWorkflow();
  
  console.log('\n5. Sales Manager Digest');
  createSalesManagerDigestWorkflow();
  
  console.log('\n6. Lead Nurturing');
  createLeadNurturingWorkflow();
  
  console.log('\n7. Lost Deal Recovery');
  createLostDealRecoveryWorkflow();
  
  console.log('\n8. Proposal Tracking');
  createProposalTrackingWorkflow();
  
  console.log('\n9. Using Pre-built Templates');
  usePrebuiltTemplates();
  
  console.log('\n10. Workflow Management');
  demonstrateWorkflowManagement();
  
  console.log('\n11. Testing Execution');
  testWorkflowExecution();
  
  console.log('\n=== All examples completed ===');
}
