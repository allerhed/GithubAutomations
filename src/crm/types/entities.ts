/**
 * Entity types for SimpleCRM
 * 
 * This module defines the core entity types (Contact, Company, Lead)
 * with support for custom fields.
 */

import { CustomFieldValue } from './custom-fields';

/**
 * Base interface for entities that support custom fields
 */
export interface EntityWithCustomFields {
  /** Unique identifier */
  id: string;
  
  /** Custom field values */
  customFields: CustomFieldValue[];
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Contact entity
 */
export interface Contact extends EntityWithCustomFields {
  /** Contact's first name */
  firstName: string;
  
  /** Contact's last name */
  lastName: string;
  
  /** Email address */
  email?: string;
  
  /** Phone number */
  phone?: string;
  
  /** Job title */
  title?: string;
  
  /** Associated company ID */
  companyId?: string;
  
  /** Contact status */
  status: 'active' | 'inactive' | 'archived';
  
  /** Owner/assignee user ID */
  ownerId?: string;
}

/**
 * Company entity
 */
export interface Company extends EntityWithCustomFields {
  /** Company name */
  name: string;
  
  /** Company website */
  website?: string;
  
  /** Primary phone number */
  phone?: string;
  
  /** Company address */
  address?: string;
  
  /** Company status */
  status: 'active' | 'inactive' | 'archived';
  
  /** Owner/assignee user ID */
  ownerId?: string;
}

/**
 * Lead entity
 */
export interface Lead extends EntityWithCustomFields {
  /** Lead's first name */
  firstName: string;
  
  /** Lead's last name */
  lastName: string;
  
  /** Email address */
  email?: string;
  
  /** Phone number */
  phone?: string;
  
  /** Company name */
  companyName?: string;
  
  /** Lead status */
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  
  /** Lead score (0-100) */
  score?: number;
  
  /** Owner/assignee user ID */
  ownerId?: string;
}
