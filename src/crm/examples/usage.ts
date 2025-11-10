/**
 * Usage Example: Custom Fields
 * 
 * This example demonstrates how to use custom fields with contacts,
 * companies, and leads, including filtering and searching capabilities.
 */

import { Contact, Company, Lead } from '../types/entities';
import { EntityType } from '../types/custom-fields';
import {
  getCustomFieldValue,
  setCustomFieldValue,
  filterByCustomField,
  filterByCustomFields,
  searchByCustomFields,
  validateEntityCustomFields
} from '../utils/custom-fields';
import {
  contactCustomFields,
  companyCustomFields,
  leadCustomFields
} from './custom-field-definitions';

// Example: Creating a contact with custom fields
const contact: Contact = {
  id: 'contact_1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0100',
  title: 'CTO',
  companyId: 'company_1',
  status: 'active',
  ownerId: 'user_1',
  customFields: [
    { fieldId: 'contact_industry', value: 'Technology' },
    { fieldId: 'contact_region', value: 'North America' },
    { fieldId: 'contact_preferred_contact_method', value: 'Email' }
  ],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

// Example: Creating a company with custom fields
const company: Company = {
  id: 'company_1',
  name: 'Acme Corporation',
  website: 'https://acme.example.com',
  phone: '+1-555-0200',
  address: '123 Business St, San Francisco, CA',
  status: 'active',
  ownerId: 'user_1',
  customFields: [
    { fieldId: 'company_industry', value: 'Technology' },
    { fieldId: 'company_region', value: 'North America' },
    { fieldId: 'company_size', value: '51-200 employees' },
    { fieldId: 'company_annual_revenue', value: 5000000 },
    { fieldId: 'company_type', value: 'Customer' }
  ],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

// Example: Creating a lead with custom fields
const lead: Lead = {
  id: 'lead_1',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '+1-555-0300',
  companyName: 'Tech Startup Inc',
  status: 'new',
  score: 75,
  ownerId: 'user_1',
  customFields: [
    { fieldId: 'lead_channel', value: 'Website Form' },
    { fieldId: 'lead_source', value: 'Product Demo Request' },
    { fieldId: 'lead_industry', value: 'Technology' },
    { fieldId: 'lead_region', value: 'North America' },
    { fieldId: 'lead_budget', value: 50000 },
    { fieldId: 'lead_interest_areas', value: ['Product A', 'Service X'] }
  ],
  createdAt: new Date('2025-11-01'),
  updatedAt: new Date('2025-11-01')
};

// Example: Getting a custom field value
console.log('Contact Industry:', getCustomFieldValue(contact, 'contact_industry'));
// Output: Technology

// Example: Setting a custom field value
const updatedContact = setCustomFieldValue(contact, 'contact_last_interaction', new Date('2025-11-10'));
console.log('Last Interaction:', getCustomFieldValue(updatedContact, 'contact_last_interaction'));

// Example: Filtering contacts by industry
const contacts: Contact[] = [
  contact,
  {
    id: 'contact_2',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    status: 'active',
    customFields: [
      { fieldId: 'contact_industry', value: 'Finance' },
      { fieldId: 'contact_region', value: 'Europe' }
    ],
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  }
];

const techContacts = filterByCustomField(contacts, {
  fieldId: 'contact_industry',
  operator: 'equals',
  value: 'Technology'
});
console.log('Technology Contacts:', techContacts.length);
// Output: 1

// Example: Filtering companies by multiple criteria
const companies: Company[] = [
  company,
  {
    id: 'company_2',
    name: 'Global Finance Corp',
    status: 'active',
    customFields: [
      { fieldId: 'company_industry', value: 'Finance' },
      { fieldId: 'company_region', value: 'Europe' },
      { fieldId: 'company_annual_revenue', value: 10000000 }
    ],
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01')
  },
  {
    id: 'company_3',
    name: 'Tech Innovations',
    status: 'active',
    customFields: [
      { fieldId: 'company_industry', value: 'Technology' },
      { fieldId: 'company_region', value: 'North America' },
      { fieldId: 'company_annual_revenue', value: 3000000 }
    ],
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-01')
  }
];

const filteredCompanies = filterByCustomFields(companies, [
  { fieldId: 'company_industry', operator: 'equals', value: 'Technology' },
  { fieldId: 'company_annual_revenue', operator: 'gte', value: 3000000 }
]);
console.log('Filtered Companies:', filteredCompanies.length);
// Output: 2 (Acme Corporation and Tech Innovations)

// Example: Searching leads by keyword
const leads: Lead[] = [
  lead,
  {
    id: 'lead_2',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob@example.com',
    companyName: 'Healthcare Solutions',
    status: 'contacted',
    customFields: [
      { fieldId: 'lead_channel', value: 'Referral' },
      { fieldId: 'lead_source', value: 'Partner Network' },
      { fieldId: 'lead_industry', value: 'Healthcare' }
    ],
    createdAt: new Date('2025-11-05'),
    updatedAt: new Date('2025-11-05')
  }
];

const searchableFieldIds = ['lead_channel', 'lead_source', 'lead_industry'];
const searchResults = searchByCustomFields(leads, 'website', searchableFieldIds);
console.log('Search Results:', searchResults.length);
// Output: 1 (lead with "Website Form" channel)

// Example: Validating custom fields
const validationResult = validateEntityCustomFields(lead, leadCustomFields);
console.log('Validation:', validationResult.valid ? 'Passed' : 'Failed');
if (!validationResult.valid) {
  console.log('Errors:', validationResult.errors);
}

// Example: Filtering leads by lead channel
const websiteLeads = filterByCustomField(leads, {
  fieldId: 'lead_channel',
  operator: 'equals',
  value: 'Website Form'
});
console.log('Website Leads:', websiteLeads.length);
// Output: 1

// Example: Filtering leads by multiple interest areas
const productInterestedLeads = filterByCustomField(leads, {
  fieldId: 'lead_interest_areas',
  operator: 'in',
  value: ['Product A']
});
console.log('Leads Interested in Product A:', productInterestedLeads.length);
// Output: 1

// Example: Filtering by region across different entity types
const northAmericanContacts = filterByCustomField(contacts, {
  fieldId: 'contact_region',
  operator: 'equals',
  value: 'North America'
});

const northAmericanCompanies = filterByCustomField(companies, {
  fieldId: 'company_region',
  operator: 'equals',
  value: 'North America'
});

const northAmericanLeads = filterByCustomField(leads, {
  fieldId: 'lead_region',
  operator: 'equals',
  value: 'North America'
});

console.log('North American Entities:');
console.log('  Contacts:', northAmericanContacts.length);
console.log('  Companies:', northAmericanCompanies.length);
console.log('  Leads:', northAmericanLeads.length);

export {
  contact,
  company,
  lead,
  contacts,
  companies,
  leads
};
