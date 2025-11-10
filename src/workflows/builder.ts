/**
 * Custom Workflow Builder
 * 
 * Provides an interface for users to build custom workflow automations
 */

import {
  Workflow,
  WorkflowTrigger,
  WorkflowAction,
  TriggerType,
  ActionType,
  ActivityType,
  TriggerCondition,
} from './types';
import { workflowEngine } from './engine';

export class WorkflowBuilder {
  private workflow: Partial<Workflow>;

  constructor() {
    this.workflow = {
      isActive: true,
      actions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Set workflow name
   */
  setName(name: string): WorkflowBuilder {
    this.workflow.name = name;
    return this;
  }

  /**
   * Set workflow description
   */
  setDescription(description: string): WorkflowBuilder {
    this.workflow.description = description;
    return this;
  }

  /**
   * Set the workflow trigger
   */
  setTrigger(type: TriggerType, conditions?: TriggerCondition[], timeDelay?: number): WorkflowBuilder {
    this.workflow.trigger = {
      type,
      conditions,
      timeDelay,
    };
    return this;
  }

  /**
   * Add a condition to the trigger
   */
  addTriggerCondition(
    field: string,
    operator: TriggerCondition['operator'],
    value: any
  ): WorkflowBuilder {
    if (!this.workflow.trigger) {
      throw new Error('Trigger must be set before adding conditions');
    }
    
    if (!this.workflow.trigger.conditions) {
      this.workflow.trigger.conditions = [];
    }
    
    this.workflow.trigger.conditions.push({ field, operator, value });
    return this;
  }

  /**
   * Add a schedule activity action
   */
  addScheduleActivityAction(
    activityType: ActivityType,
    subject: string,
    description: string,
    dueDate: string | number,
    assignTo?: string
  ): WorkflowBuilder {
    this.workflow.actions!.push({
      type: ActionType.SCHEDULE_ACTIVITY,
      config: {
        activityType,
        subject,
        description,
        dueDate,
        assignTo,
      },
    });
    return this;
  }

  /**
   * Add a send email action
   */
  addSendEmailAction(
    emailTemplate: string,
    subject: string,
    emailTo?: string[]
  ): WorkflowBuilder {
    this.workflow.actions!.push({
      type: ActionType.SEND_EMAIL,
      config: {
        emailTemplate,
        subject,
        emailTo,
      },
    });
    return this;
  }

  /**
   * Add an update field action
   */
  addUpdateFieldAction(fieldName: string, fieldValue: any): WorkflowBuilder {
    this.workflow.actions!.push({
      type: ActionType.UPDATE_FIELD,
      config: {
        fieldName,
        fieldValue,
      },
    });
    return this;
  }

  /**
   * Add a create task action
   */
  addCreateTaskAction(
    subject: string,
    description: string,
    dueDate: string | number,
    assignTo?: string
  ): WorkflowBuilder {
    this.workflow.actions!.push({
      type: ActionType.CREATE_TASK,
      config: {
        subject,
        description,
        dueDate,
        assignTo,
      },
    });
    return this;
  }

  /**
   * Add an assign owner action
   */
  addAssignOwnerAction(assignTo: string): WorkflowBuilder {
    this.workflow.actions!.push({
      type: ActionType.ASSIGN_OWNER,
      config: {
        assignTo,
      },
    });
    return this;
  }

  /**
   * Add a send notification action
   */
  addSendNotificationAction(message: string, assignTo?: string): WorkflowBuilder {
    this.workflow.actions!.push({
      type: ActionType.SEND_NOTIFICATION,
      config: {
        notificationMessage: message,
        assignTo,
      },
    });
    return this;
  }

  /**
   * Add a webhook action
   */
  addWebhookAction(webhookUrl: string): WorkflowBuilder {
    this.workflow.actions!.push({
      type: ActionType.WEBHOOK,
      config: {
        webhookUrl,
      },
    });
    return this;
  }

  /**
   * Set whether the workflow is active
   */
  setActive(isActive: boolean): WorkflowBuilder {
    this.workflow.isActive = isActive;
    return this;
  }

  /**
   * Set the workflow creator
   */
  setCreatedBy(userId: string): WorkflowBuilder {
    this.workflow.createdBy = userId;
    return this;
  }

  /**
   * Build and validate the workflow
   */
  build(): Workflow {
    // Validate required fields
    if (!this.workflow.name) {
      throw new Error('Workflow name is required');
    }
    if (!this.workflow.description) {
      throw new Error('Workflow description is required');
    }
    if (!this.workflow.trigger) {
      throw new Error('Workflow trigger is required');
    }
    if (!this.workflow.actions || this.workflow.actions.length === 0) {
      throw new Error('At least one action is required');
    }
    if (!this.workflow.createdBy) {
      throw new Error('Workflow creator is required');
    }

    // Generate ID if not present
    if (!this.workflow.id) {
      this.workflow.id = this.generateId();
    }

    return this.workflow as Workflow;
  }

  /**
   * Build and register the workflow with the engine
   */
  buildAndRegister(): Workflow {
    const workflow = this.build();
    workflowEngine.registerWorkflow(workflow);
    return workflow;
  }

  /**
   * Generate a unique workflow ID
   */
  private generateId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a builder from an existing workflow
   */
  static fromWorkflow(workflow: Workflow): WorkflowBuilder {
    const builder = new WorkflowBuilder();
    builder.workflow = { ...workflow };
    return builder;
  }

  /**
   * Clone the current builder
   */
  clone(): WorkflowBuilder {
    const builder = new WorkflowBuilder();
    builder.workflow = JSON.parse(JSON.stringify(this.workflow));
    return builder;
  }
}

/**
 * Helper function to create a new workflow builder
 */
export function createWorkflow(): WorkflowBuilder {
  return new WorkflowBuilder();
}

/**
 * Fluent interface examples:
 * 
 * Example 1: Deal stage change workflow
 * ```typescript
 * const workflow = createWorkflow()
 *   .setName('Deal Stage Change Follow-up')
 *   .setDescription('Automatically schedule follow-up when deal moves to proposal stage')
 *   .setTrigger(TriggerType.DEAL_STAGE_CHANGED)
 *   .addTriggerCondition('newStage', 'equals', 'proposal')
 *   .addScheduleActivityAction(
 *     ActivityType.CALL,
 *     'Follow-up call',
 *     'Discuss proposal with customer',
 *     2
 *   )
 *   .addSendEmailAction('proposal_sent', 'Proposal Sent')
 *   .setCreatedBy('user123')
 *   .buildAndRegister();
 * ```
 * 
 * Example 2: New lead assignment
 * ```typescript
 * const workflow = createWorkflow()
 *   .setName('New Lead Auto-Assignment')
 *   .setDescription('Assign new leads and schedule first contact')
 *   .setTrigger(TriggerType.CONTACT_CREATED)
 *   .addTriggerCondition('type', 'equals', 'lead')
 *   .addAssignOwnerAction('sales_rep_1')
 *   .addScheduleActivityAction(
 *     ActivityType.CALL,
 *     'Initial contact',
 *     'Reach out to new lead',
 *     1
 *   )
 *   .setCreatedBy('manager1')
 *   .buildAndRegister();
 * ```
 */
