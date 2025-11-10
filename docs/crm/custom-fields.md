# Custom Fields for SimpleCRM

## Overview

Custom fields allow you to extend contacts, companies, and leads with business-specific data that meets your unique requirements. This feature addresses the need for flexible data storage as outlined in the SimpleCRM Business Requirements Document.

## Key Features

- **Define Custom Fields**: Create custom fields with various data types (text, number, date, select, etc.)
- **Filter by Custom Fields**: Filter entities using custom field values with multiple operators
- **Search Capabilities**: Search across custom fields to find relevant entities
- **Validation**: Built-in validation for custom field values based on their definitions
- **Type Safety**: Full TypeScript support with strongly-typed interfaces

## Supported Data Types

Custom fields support the following data types:

| Type | Description | Example |
|------|-------------|---------|
| `TEXT` | Free-form text | "Enterprise Customer" |
| `NUMBER` | Numeric values | 50000 |
| `DATE` | Date values | "2025-11-10" |
| `BOOLEAN` | True/false values | true |
| `SELECT` | Single selection from options | "Technology" |
| `MULTI_SELECT` | Multiple selections | ["Product A", "Service X"] |
| `EMAIL` | Email addresses | "user@example.com" |
| `PHONE` | Phone numbers | "+1-555-0100" |
| `URL` | Web URLs | "https://example.com" |

## Usage Examples

### 1. Creating Entities with Custom Fields

#### Contact with Custom Fields

```typescript
import { Contact } from './crm';

const contact: Contact = {
  id: 'contact_1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  status: 'active',
  customFields: [
    { fieldId: 'contact_industry', value: 'Technology' },
    { fieldId: 'contact_region', value: 'North America' },
    { fieldId: 'contact_preferred_contact_method', value: 'Email' }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

#### Company with Custom Fields

```typescript
import { Company } from './crm';

const company: Company = {
  id: 'company_1',
  name: 'Acme Corporation',
  status: 'active',
  customFields: [
    { fieldId: 'company_industry', value: 'Technology' },
    { fieldId: 'company_region', value: 'North America' },
    { fieldId: 'company_size', value: '51-200 employees' },
    { fieldId: 'company_annual_revenue', value: 5000000 }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

#### Lead with Custom Fields

```typescript
import { Lead } from './crm';

const lead: Lead = {
  id: 'lead_1',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  status: 'new',
  customFields: [
    { fieldId: 'lead_channel', value: 'Website Form' },
    { fieldId: 'lead_source', value: 'Product Demo Request' },
    { fieldId: 'lead_industry', value: 'Technology' },
    { fieldId: 'lead_budget', value: 50000 }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### 2. Filtering by Custom Fields

#### Filter by Single Custom Field

```typescript
import { filterByCustomField } from './crm';

// Filter contacts in the Technology industry
const techContacts = filterByCustomField(contacts, {
  fieldId: 'contact_industry',
  operator: 'equals',
  value: 'Technology'
});

// Filter companies with revenue >= $5M
const largeCompanies = filterByCustomField(companies, {
  fieldId: 'company_annual_revenue',
  operator: 'gte',
  value: 5000000
});

// Filter leads from Website Form channel
const websiteLeads = filterByCustomField(leads, {
  fieldId: 'lead_channel',
  operator: 'equals',
  value: 'Website Form'
});
```

#### Filter by Multiple Custom Fields

```typescript
import { filterByCustomFields } from './crm';

// Filter companies: Technology industry AND North America region
const filteredCompanies = filterByCustomFields(companies, [
  { fieldId: 'company_industry', operator: 'equals', value: 'Technology' },
  { fieldId: 'company_region', operator: 'equals', value: 'North America' }
]);

// Filter leads: High budget AND specific channel
const qualifiedLeads = filterByCustomFields(leads, [
  { fieldId: 'lead_budget', operator: 'gte', value: 50000 },
  { fieldId: 'lead_channel', operator: 'in', value: ['Website Form', 'Referral'] }
]);
```

### 3. Searching Custom Fields

```typescript
import { searchByCustomFields } from './crm';

// Search leads by custom fields
const searchableFields = ['lead_channel', 'lead_source', 'lead_industry'];
const results = searchByCustomFields(leads, 'website', searchableFields);

// Search contacts
const contactSearchFields = ['contact_industry', 'contact_region'];
const contactResults = searchByCustomFields(contacts, 'tech', contactSearchFields);
```

### 4. Getting and Setting Custom Field Values

```typescript
import { getCustomFieldValue, setCustomFieldValue } from './crm';

// Get a custom field value
const industry = getCustomFieldValue(contact, 'contact_industry');
console.log('Industry:', industry); // Output: "Technology"

// Set a custom field value
const updatedContact = setCustomFieldValue(
  contact,
  'contact_last_interaction',
  new Date()
);
```

### 5. Validating Custom Fields

```typescript
import { validateEntityCustomFields, contactCustomFields } from './crm';

// Validate all custom fields on a contact
const validation = validateEntityCustomFields(contact, contactCustomFields);

if (validation.valid) {
  console.log('All fields are valid');
} else {
  console.log('Validation errors:', validation.errors);
}
```

## Available Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Exact match | `value: 'Technology'` |
| `contains` | Contains substring (case-insensitive) | `value: 'tech'` |
| `startsWith` | Starts with string | `value: 'Tech'` |
| `endsWith` | Ends with string | `value: 'nology'` |
| `gt` | Greater than | `value: 1000000` |
| `lt` | Less than | `value: 500000` |
| `gte` | Greater than or equal | `value: 50000` |
| `lte` | Less than or equal | `value: 100000` |
| `in` | In array of values | `value: ['Tech', 'Finance']` |

## Pre-defined Custom Fields

The system comes with example custom field definitions for common business needs:

### Contact Fields
- **Industry**: Technology, Finance, Healthcare, etc.
- **Region**: North America, Europe, Asia, etc.
- **Preferred Contact Method**: Email, Phone, SMS, LinkedIn
- **Last Interaction Date**: Date field

### Company Fields
- **Industry**: Technology, Finance, Healthcare, etc.
- **Region**: Geographic regions
- **Company Size**: Employee count ranges
- **Annual Revenue**: Numeric revenue field
- **Company Type**: Prospect, Customer, Partner, Competitor

### Lead Fields
- **Lead Channel**: Website Form, Social Media, Email Campaign, etc.
- **Lead Source**: Specific campaign or source name
- **Industry**: Industry sector
- **Region**: Geographic region
- **Budget**: Estimated budget
- **Interest Areas**: Multiple product/service selections
- **Expected Close Date**: Target conversion date

## Defining New Custom Fields

You can define your own custom fields using the `CustomFieldDefinition` interface:

```typescript
import { CustomFieldDefinition, CustomFieldType } from './crm';

const customField: CustomFieldDefinition = {
  id: 'company_certifications',
  name: 'Certifications',
  type: CustomFieldType.MULTI_SELECT,
  required: false,
  options: ['ISO 9001', 'ISO 27001', 'SOC 2', 'HIPAA'],
  searchable: true,
  filterable: true,
  description: 'Industry certifications held by the company'
};
```

## Best Practices

1. **Use Descriptive IDs**: Use clear, prefixed field IDs like `contact_industry`, `company_region`
2. **Set Searchable Flag**: Mark text fields as searchable when users need to search by them
3. **Set Filterable Flag**: Enable filtering for fields used in reports and dashboards
4. **Provide Options**: For SELECT fields, provide clear, comprehensive options
5. **Add Descriptions**: Include helpful descriptions for field definitions
6. **Validate Data**: Always validate custom field values before saving
7. **Consider Performance**: Limit the number of custom fields per entity (recommended: 10-20)

## Integration with SimpleCRM Features

Custom fields integrate seamlessly with core SimpleCRM features:

- **Visual Pipeline**: Filter deals by custom fields on companies/contacts
- **Dashboards**: Create reports based on custom field values
- **Lead Qualification**: Use custom fields like budget and industry for lead scoring
- **Workflow Automation**: Trigger actions based on custom field values
- **Search**: Find entities by searching custom field values
- **Export**: Include custom fields in CSV/Excel exports

## API Reference

See the [API Documentation](./api-reference.md) for detailed information on:
- Type definitions
- Utility functions
- Example implementations

## Support and Feedback

For questions or feature requests related to custom fields, please refer to the SimpleCRM BRD in `inbox/crm.md` or contact the development team.
