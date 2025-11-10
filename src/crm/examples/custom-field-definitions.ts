/**
 * Example Custom Field Definitions
 * 
 * This file provides example custom field definitions for contacts,
 * companies, and leads as mentioned in the SimpleCRM requirements.
 */

import { CustomFieldDefinition, CustomFieldType, EntityType } from '../types/custom-fields';

/**
 * Example custom fields for Contacts
 */
export const contactCustomFields: CustomFieldDefinition[] = [
  {
    id: 'contact_industry',
    name: 'Industry',
    type: CustomFieldType.SELECT,
    required: false,
    options: [
      'Technology',
      'Finance',
      'Healthcare',
      'Retail',
      'Manufacturing',
      'Education',
      'Real Estate',
      'Other'
    ],
    searchable: true,
    filterable: true,
    description: 'The industry sector the contact works in'
  },
  {
    id: 'contact_region',
    name: 'Region',
    type: CustomFieldType.SELECT,
    required: false,
    options: [
      'North America',
      'South America',
      'Europe',
      'Asia',
      'Africa',
      'Oceania'
    ],
    searchable: true,
    filterable: true,
    description: 'Geographic region where the contact is located'
  },
  {
    id: 'contact_preferred_contact_method',
    name: 'Preferred Contact Method',
    type: CustomFieldType.SELECT,
    required: false,
    options: ['Email', 'Phone', 'SMS', 'LinkedIn'],
    searchable: false,
    filterable: true,
    description: 'How the contact prefers to be reached'
  },
  {
    id: 'contact_last_interaction',
    name: 'Last Interaction Date',
    type: CustomFieldType.DATE,
    required: false,
    searchable: false,
    filterable: true,
    description: 'Date of last interaction with this contact'
  }
];

/**
 * Example custom fields for Companies
 */
export const companyCustomFields: CustomFieldDefinition[] = [
  {
    id: 'company_industry',
    name: 'Industry',
    type: CustomFieldType.SELECT,
    required: false,
    options: [
      'Technology',
      'Finance',
      'Healthcare',
      'Retail',
      'Manufacturing',
      'Education',
      'Real Estate',
      'Other'
    ],
    searchable: true,
    filterable: true,
    description: 'The primary industry sector of the company'
  },
  {
    id: 'company_region',
    name: 'Region',
    type: CustomFieldType.SELECT,
    required: false,
    options: [
      'North America',
      'South America',
      'Europe',
      'Asia',
      'Africa',
      'Oceania'
    ],
    searchable: true,
    filterable: true,
    description: 'Primary geographic region of operations'
  },
  {
    id: 'company_size',
    name: 'Company Size',
    type: CustomFieldType.SELECT,
    required: false,
    options: [
      '1-10 employees',
      '11-50 employees',
      '51-200 employees',
      '201-500 employees',
      '501-1000 employees',
      '1000+ employees'
    ],
    searchable: false,
    filterable: true,
    description: 'Number of employees in the company'
  },
  {
    id: 'company_annual_revenue',
    name: 'Annual Revenue',
    type: CustomFieldType.NUMBER,
    required: false,
    searchable: false,
    filterable: true,
    description: 'Estimated annual revenue in USD'
  },
  {
    id: 'company_type',
    name: 'Company Type',
    type: CustomFieldType.SELECT,
    required: false,
    options: ['Prospect', 'Customer', 'Partner', 'Competitor'],
    searchable: false,
    filterable: true,
    description: 'Type of relationship with the company'
  }
];

/**
 * Example custom fields for Leads
 */
export const leadCustomFields: CustomFieldDefinition[] = [
  {
    id: 'lead_channel',
    name: 'Lead Channel',
    type: CustomFieldType.SELECT,
    required: false,
    options: [
      'Website Form',
      'Social Media',
      'Email Campaign',
      'Cold Call',
      'Referral',
      'Trade Show',
      'Partner',
      'Other'
    ],
    searchable: true,
    filterable: true,
    description: 'Channel through which the lead was acquired'
  },
  {
    id: 'lead_source',
    name: 'Lead Source',
    type: CustomFieldType.TEXT,
    required: false,
    searchable: true,
    filterable: true,
    description: 'Specific source of the lead (e.g., campaign name, event name)'
  },
  {
    id: 'lead_industry',
    name: 'Industry',
    type: CustomFieldType.SELECT,
    required: false,
    options: [
      'Technology',
      'Finance',
      'Healthcare',
      'Retail',
      'Manufacturing',
      'Education',
      'Real Estate',
      'Other'
    ],
    searchable: true,
    filterable: true,
    description: 'The industry sector the lead is in'
  },
  {
    id: 'lead_region',
    name: 'Region',
    type: CustomFieldType.SELECT,
    required: false,
    options: [
      'North America',
      'South America',
      'Europe',
      'Asia',
      'Africa',
      'Oceania'
    ],
    searchable: true,
    filterable: true,
    description: 'Geographic region of the lead'
  },
  {
    id: 'lead_budget',
    name: 'Budget',
    type: CustomFieldType.NUMBER,
    required: false,
    searchable: false,
    filterable: true,
    description: 'Estimated budget in USD'
  },
  {
    id: 'lead_interest_areas',
    name: 'Interest Areas',
    type: CustomFieldType.MULTI_SELECT,
    required: false,
    options: [
      'Product A',
      'Product B',
      'Product C',
      'Service X',
      'Service Y',
      'Service Z'
    ],
    searchable: false,
    filterable: true,
    description: 'Products or services the lead is interested in'
  },
  {
    id: 'lead_expected_close_date',
    name: 'Expected Close Date',
    type: CustomFieldType.DATE,
    required: false,
    searchable: false,
    filterable: true,
    description: 'Expected date for converting the lead'
  }
];

/**
 * Get all custom field definitions by entity type
 */
export function getCustomFieldsByEntityType(entityType: EntityType): CustomFieldDefinition[] {
  switch (entityType) {
    case EntityType.CONTACT:
      return contactCustomFields;
    case EntityType.COMPANY:
      return companyCustomFields;
    case EntityType.LEAD:
      return leadCustomFields;
    default:
      return [];
  }
}
