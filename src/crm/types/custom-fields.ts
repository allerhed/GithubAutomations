/**
 * Custom Fields for SimpleCRM
 * 
 * This module defines the types and interfaces for custom fields
 * that can be added to contacts, companies, and leads.
 */

/**
 * Supported data types for custom fields
 */
export enum CustomFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url'
}

/**
 * Definition of a custom field
 */
export interface CustomFieldDefinition {
  /** Unique identifier for the field */
  id: string;
  
  /** Display name for the field */
  name: string;
  
  /** Data type of the field */
  type: CustomFieldType;
  
  /** Whether the field is required */
  required: boolean;
  
  /** For SELECT and MULTI_SELECT types, the available options */
  options?: string[];
  
  /** Default value for the field */
  defaultValue?: any;
  
  /** Help text or description for the field */
  description?: string;
  
  /** Whether the field is searchable */
  searchable: boolean;
  
  /** Whether the field can be used for filtering */
  filterable: boolean;
}

/**
 * A custom field value attached to an entity
 */
export interface CustomFieldValue {
  /** ID of the custom field definition */
  fieldId: string;
  
  /** The actual value */
  value: any;
}

/**
 * Entity type that can have custom fields
 */
export enum EntityType {
  CONTACT = 'contact',
  COMPANY = 'company',
  LEAD = 'lead'
}
