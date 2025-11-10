/**
 * Workflow Engine
 * 
 * Core engine for executing workflow automations
 */

import {
  Workflow,
  WorkflowExecution,
  WorkflowTrigger,
  WorkflowAction,
  TriggerCondition,
  TriggerType,
  ActionType,
  ActivityType,
} from './types';

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();

  /**
   * Register a workflow with the engine
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Unregister a workflow
   */
  unregisterWorkflow(workflowId: string): void {
    this.workflows.delete(workflowId);
  }

  /**
   * Get all active workflows
   */
  getActiveWorkflows(): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.isActive);
  }

  /**
   * Trigger workflows based on an event
   */
  async triggerWorkflows(
    triggerType: TriggerType,
    context: Record<string, any>
  ): Promise<WorkflowExecution[]> {
    const matchingWorkflows = this.getActiveWorkflows().filter(workflow =>
      workflow.trigger.type === triggerType &&
      this.evaluateConditions(workflow.trigger.conditions || [], context)
    );

    const executions: WorkflowExecution[] = [];

    for (const workflow of matchingWorkflows) {
      const execution = await this.executeWorkflow(workflow, context);
      executions.push(execution);
    }

    return executions;
  }

  /**
   * Execute a workflow with the given context
   */
  private async executeWorkflow(
    workflow: Workflow,
    context: Record<string, any>
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateId(),
      workflowId: workflow.id,
      triggeredAt: new Date().toISOString(),
      status: 'running',
      context,
    };

    this.executions.set(execution.id, execution);

    try {
      // Apply time delay if specified
      if (workflow.trigger.timeDelay) {
        await this.delay(workflow.trigger.timeDelay * 60 * 1000);
      }

      // Execute all actions sequentially
      for (const action of workflow.actions) {
        await this.executeAction(action, context);
      }

      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      
      // Update execution count
      workflow.executionCount = (workflow.executionCount || 0) + 1;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
      execution.completedAt = new Date().toISOString();
    }

    return execution;
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    switch (action.type) {
      case ActionType.SCHEDULE_ACTIVITY:
        await this.scheduleActivity(action, context);
        break;
      case ActionType.SEND_EMAIL:
        await this.sendEmail(action, context);
        break;
      case ActionType.UPDATE_FIELD:
        await this.updateField(action, context);
        break;
      case ActionType.CREATE_TASK:
        await this.createTask(action, context);
        break;
      case ActionType.ASSIGN_OWNER:
        await this.assignOwner(action, context);
        break;
      case ActionType.SEND_NOTIFICATION:
        await this.sendNotification(action, context);
        break;
      case ActionType.WEBHOOK:
        await this.callWebhook(action, context);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Schedule an activity (e.g., follow-up, call, meeting)
   */
  private async scheduleActivity(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    const { activityType, subject, description, dueDate, assignTo } = action.config;
    
    // Implementation would integrate with activity scheduling system
    console.log('Scheduling activity:', {
      type: activityType,
      subject,
      description,
      dueDate: this.calculateDueDate(dueDate),
      assignTo,
      dealId: context.dealId,
      contactId: context.contactId,
    });
  }

  /**
   * Send an automated email
   */
  private async sendEmail(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    const { emailTemplate, emailTo, subject } = action.config;
    
    // Implementation would integrate with email service
    console.log('Sending email:', {
      template: emailTemplate,
      to: emailTo,
      subject,
      context,
    });
  }

  /**
   * Update a field value
   */
  private async updateField(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    const { fieldName, fieldValue } = action.config;
    
    // Implementation would integrate with data update system
    console.log('Updating field:', {
      field: fieldName,
      value: fieldValue,
      entityId: context.dealId || context.contactId,
    });
  }

  /**
   * Create a task
   */
  private async createTask(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    const { subject, description, dueDate, assignTo } = action.config;
    
    // Implementation would integrate with task management system
    console.log('Creating task:', {
      subject,
      description,
      dueDate: this.calculateDueDate(dueDate),
      assignTo,
      context,
    });
  }

  /**
   * Assign an owner
   */
  private async assignOwner(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    const { assignTo } = action.config;
    
    // Implementation would integrate with ownership assignment system
    console.log('Assigning owner:', {
      assignTo,
      entityId: context.dealId || context.contactId,
    });
  }

  /**
   * Send a notification
   */
  private async sendNotification(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    const { notificationMessage, assignTo } = action.config;
    
    // Implementation would integrate with notification system
    console.log('Sending notification:', {
      message: notificationMessage,
      to: assignTo,
      context,
    });
  }

  /**
   * Call a webhook
   */
  private async callWebhook(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    const { webhookUrl } = action.config;
    
    // Implementation would make HTTP request to webhook
    console.log('Calling webhook:', {
      url: webhookUrl,
      payload: context,
    });
  }

  /**
   * Evaluate trigger conditions against context
   */
  private evaluateConditions(
    conditions: TriggerCondition[],
    context: Record<string, any>
  ): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(context, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'contains':
          return String(fieldValue).includes(String(condition.value));
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        case 'is_empty':
          return !fieldValue || fieldValue === '';
        case 'is_not_empty':
          return !!fieldValue && fieldValue !== '';
        default:
          return false;
      }
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Calculate due date from config
   */
  private calculateDueDate(dueDate?: string | number): string {
    if (!dueDate) {
      return new Date().toISOString();
    }
    
    if (typeof dueDate === 'string') {
      return dueDate;
    }
    
    // If number, treat as days from now
    const date = new Date();
    date.setDate(date.getDate() + dueDate);
    return date.toISOString();
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get execution history for a workflow
   */
  getExecutionHistory(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(exec => exec.workflowId === workflowId)
      .sort((a, b) => b.triggeredAt.localeCompare(a.triggeredAt));
  }

  /**
   * Get a specific workflow by ID
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine();
