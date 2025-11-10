/**
 * Lead Assignment Rules Engine
 * Assigns leads to sales reps based on configurable rules
 */

import { Lead, AssignmentRule, AssignmentCondition } from './types';

export class LeadAssignmentEngine {
  private rules: AssignmentRule[];

  constructor(rules: AssignmentRule[] = []) {
    this.rules = rules.filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Assign a lead to a sales rep based on rules
   * Returns the ID of the assigned sales rep or null if no rule matches
   */
  assignLead(lead: Lead): string | null {
    for (const rule of this.rules) {
      if (this.evaluateRule(lead, rule)) {
        return rule.assignTo;
      }
    }
    return null;
  }

  /**
   * Evaluate if a lead matches all conditions in a rule
   */
  private evaluateRule(lead: Lead, rule: AssignmentRule): boolean {
    return rule.conditions.every(condition => this.evaluateCondition(lead, condition));
  }

  /**
   * Evaluate a single condition against a lead
   */
  private evaluateCondition(lead: Lead, condition: AssignmentCondition): boolean {
    const fieldValue = this.getFieldValue(lead, condition.field);
    
    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    const stringValue = String(fieldValue).toLowerCase();
    
    switch (condition.operator) {
      case 'equals':
        return stringValue === String(condition.value).toLowerCase();
      
      case 'contains':
        return stringValue.includes(String(condition.value).toLowerCase());
      
      case 'startsWith':
        return stringValue.startsWith(String(condition.value).toLowerCase());
      
      case 'in':
        if (!Array.isArray(condition.value)) {
          return false;
        }
        return condition.value.some(v => 
          String(v).toLowerCase() === stringValue
        );
      
      default:
        return false;
    }
  }

  /**
   * Get field value from lead object, supporting nested properties
   */
  private getFieldValue(lead: Lead, field: string): any {
    const parts = field.split('.');
    let value: any = lead;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Add a new rule to the engine
   */
  addRule(rule: AssignmentRule): void {
    this.rules.push(rule);
    this.rules = this.rules.filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove a rule from the engine
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  /**
   * Update an existing rule
   */
  updateRule(ruleId: string, updates: Partial<AssignmentRule>): void {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      this.rules = this.rules.filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
    }
  }

  /**
   * Get all rules
   */
  getRules(): AssignmentRule[] {
    return [...this.rules];
  }
}
