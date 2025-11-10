/**
 * Lead Capture Service
 * Handles lead capture from various sources and feeds them into the CRM pipeline
 */

import { Lead, LeadSource, LeadStatus } from './types';
import { LeadAssignmentEngine } from './lead-assignment';

export interface LeadCaptureData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  productInterest?: string;
  geography?: string;
  message?: string;
  customFields?: Record<string, any>;
}

export interface CRMPipeline {
  addLead(lead: Lead): Promise<void>;
}

export class LeadCaptureService {
  private assignmentEngine: LeadAssignmentEngine;
  private pipeline: CRMPipeline;

  constructor(assignmentEngine: LeadAssignmentEngine, pipeline: CRMPipeline) {
    this.assignmentEngine = assignmentEngine;
    this.pipeline = pipeline;
  }

  /**
   * Capture a lead from a web form
   */
  async captureFromForm(data: LeadCaptureData): Promise<Lead> {
    return this.captureLead(data, LeadSource.WebForm);
  }

  /**
   * Capture a lead from a chat widget
   */
  async captureFromChat(data: LeadCaptureData): Promise<Lead> {
    return this.captureLead(data, LeadSource.ChatWidget);
  }

  /**
   * Core lead capture logic
   */
  private async captureLead(data: LeadCaptureData, source: LeadSource): Promise<Lead> {
    // Validate required fields
    this.validateLeadData(data);

    // Create lead object
    const lead: Lead = {
      id: this.generateLeadId(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim(),
      company: data.company?.trim(),
      jobTitle: data.jobTitle?.trim(),
      source,
      productInterest: data.productInterest?.trim(),
      geography: data.geography?.trim(),
      message: data.message?.trim(),
      createdAt: new Date(),
      status: LeadStatus.New,
      customFields: data.customFields
    };

    // Assign lead to sales rep based on rules
    const assignedTo = this.assignmentEngine.assignLead(lead);
    if (assignedTo) {
      lead.assignedTo = assignedTo;
    }

    // Feed into CRM pipeline
    await this.pipeline.addLead(lead);

    return lead;
  }

  /**
   * Validate lead data
   */
  private validateLeadData(data: LeadCaptureData): void {
    if (!data.firstName || data.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    
    if (!data.lastName || data.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Valid email is required');
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate a unique lead ID
   */
  private generateLeadId(): string {
    return `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
