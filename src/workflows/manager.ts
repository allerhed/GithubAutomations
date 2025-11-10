/**
 * Workflow Manager
 * 
 * High-level API for managing workflows, templates, and executions
 */

import { Workflow, WorkflowTemplate, WorkflowExecution, TriggerType } from './types';
import { workflowEngine } from './engine';
import { 
  getWorkflowTemplates, 
  getTemplatesByCategory, 
  getTemplateById,
  searchTemplatesByTag,
  getCategories,
} from './templates';
import { WorkflowBuilder } from './builder';

export class WorkflowManager {
  /**
   * Create a new workflow from a template
   */
  createFromTemplate(templateId: string, userId: string): Workflow {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const workflow: Workflow = {
      id: this.generateId(),
      name: template.name,
      description: template.description,
      isActive: true,
      trigger: template.trigger,
      actions: template.actions,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
    };

    workflowEngine.registerWorkflow(workflow);
    return workflow;
  }

  /**
   * Get all available templates
   */
  getTemplates(): WorkflowTemplate[] {
    return getWorkflowTemplates();
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return getTemplatesByCategory(category);
  }

  /**
   * Search templates by tag
   */
  searchTemplates(tag: string): WorkflowTemplate[] {
    return searchTemplatesByTag(tag);
  }

  /**
   * Get all template categories
   */
  getCategories(): string[] {
    return getCategories();
  }

  /**
   * Create a custom workflow using builder
   */
  createCustomWorkflow(): WorkflowBuilder {
    return new WorkflowBuilder();
  }

  /**
   * Get all active workflows
   */
  getActiveWorkflows(): Workflow[] {
    return workflowEngine.getActiveWorkflows();
  }

  /**
   * Get a specific workflow
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return workflowEngine.getWorkflow(workflowId);
  }

  /**
   * Update an existing workflow
   */
  updateWorkflow(workflowId: string, updates: Partial<Workflow>): Workflow {
    const existing = workflowEngine.getWorkflow(workflowId);
    if (!existing) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const updated: Workflow = {
      ...existing,
      ...updates,
      id: workflowId, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    workflowEngine.registerWorkflow(updated);
    return updated;
  }

  /**
   * Delete a workflow
   */
  deleteWorkflow(workflowId: string): void {
    workflowEngine.unregisterWorkflow(workflowId);
  }

  /**
   * Activate a workflow
   */
  activateWorkflow(workflowId: string): Workflow {
    return this.updateWorkflow(workflowId, { isActive: true });
  }

  /**
   * Deactivate a workflow
   */
  deactivateWorkflow(workflowId: string): Workflow {
    return this.updateWorkflow(workflowId, { isActive: false });
  }

  /**
   * Trigger workflows manually
   */
  async triggerWorkflows(
    triggerType: TriggerType,
    context: Record<string, any>
  ): Promise<WorkflowExecution[]> {
    return workflowEngine.triggerWorkflows(triggerType, context);
  }

  /**
   * Get execution history for a workflow
   */
  getExecutionHistory(workflowId: string): WorkflowExecution[] {
    return workflowEngine.getExecutionHistory(workflowId);
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStats(workflowId: string): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
  } {
    const executions = workflowEngine.getExecutionHistory(workflowId);
    
    const successful = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    
    const completedExecutions = executions.filter(
      e => e.status === 'completed' && e.completedAt
    );
    
    const totalTime = completedExecutions.reduce((sum, exec) => {
      const start = new Date(exec.triggeredAt).getTime();
      const end = new Date(exec.completedAt!).getTime();
      return sum + (end - start);
    }, 0);
    
    const avgTime = completedExecutions.length > 0 
      ? totalTime / completedExecutions.length 
      : 0;

    return {
      totalExecutions: executions.length,
      successfulExecutions: successful,
      failedExecutions: failed,
      averageExecutionTime: avgTime,
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export workflow as JSON
   */
  exportWorkflow(workflowId: string): string {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }
    return JSON.stringify(workflow, null, 2);
  }

  /**
   * Import workflow from JSON
   */
  importWorkflow(json: string, userId: string): Workflow {
    const data = JSON.parse(json);
    
    const workflow: Workflow = {
      ...data,
      id: this.generateId(), // Generate new ID
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
    };

    workflowEngine.registerWorkflow(workflow);
    return workflow;
  }
}

// Export singleton instance
export const workflowManager = new WorkflowManager();
