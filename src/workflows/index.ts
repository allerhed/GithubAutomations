/**
 * Workflow Automation System
 * 
 * Main export file for the workflow automation system
 */

// Core types
export * from './types';

// Workflow engine
export { WorkflowEngine, workflowEngine } from './engine';

// Workflow builder
export { WorkflowBuilder, createWorkflow } from './builder';

// Pre-built templates
export {
  workflowTemplates,
  getWorkflowTemplates,
  getTemplatesByCategory,
  getTemplateById,
  searchTemplatesByTag,
  getCategories,
} from './templates';

// Workflow manager
export { WorkflowManager, workflowManager } from './manager';
