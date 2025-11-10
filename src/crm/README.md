# SimpleCRM - Custom Fields Implementation

This directory contains the implementation of custom fields for the SimpleCRM system, addressing the requirement from section 4.1 of the Business Requirements Document.

## Features Implemented

✅ **Define Custom Fields**: Users can define custom fields for contacts, companies, and leads with:
- Multiple data types (text, number, date, boolean, select, multi-select, email, phone, URL)
- Required/optional field settings
- Searchable and filterable flags
- Validation rules
- Default values and descriptions

✅ **Filter by Custom Fields**: Comprehensive filtering capabilities with operators:
- Equality and inequality checks
- Text matching (contains, starts with, ends with)
- Numeric comparisons (greater than, less than, etc.)
- Array membership checks
- Multi-field AND filtering

✅ **Search Using Custom Fields**: Full-text search across searchable custom fields

## Directory Structure

```
src/crm/
├── index.ts                           # Main export file
├── types/
│   ├── custom-fields.ts              # Custom field type definitions
│   └── entities.ts                    # Contact, Company, Lead interfaces
├── utils/
│   └── custom-fields.ts              # Filtering, searching, validation utilities
└── examples/
    ├── custom-field-definitions.ts   # Pre-defined custom fields
    └── usage.ts                       # Usage examples

docs/crm/
└── custom-fields.md                   # Complete documentation
```

## Quick Start

### 1. Import the Module

```typescript
import {
  Contact,
  Company,
  Lead,
  CustomFieldType,
  filterByCustomField,
  searchByCustomFields,
  contactCustomFields,
  companyCustomFields,
  leadCustomFields
} from './src/crm';
```

### 2. Create Entities with Custom Fields

```typescript
const contact: Contact = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  status: 'active',
  customFields: [
    { fieldId: 'contact_industry', value: 'Technology' },
    { fieldId: 'contact_region', value: 'North America' }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### 3. Filter by Custom Fields

```typescript
// Single field filter
const techContacts = filterByCustomField(contacts, {
  fieldId: 'contact_industry',
  operator: 'equals',
  value: 'Technology'
});

// Multiple fields filter
const filteredCompanies = filterByCustomFields(companies, [
  { fieldId: 'company_industry', operator: 'equals', value: 'Technology' },
  { fieldId: 'company_annual_revenue', operator: 'gte', value: 5000000 }
]);
```

### 4. Search Custom Fields

```typescript
const results = searchByCustomFields(
  leads,
  'website',
  ['lead_channel', 'lead_source']
);
```

## Pre-defined Custom Fields

The implementation includes example custom fields for common business needs:

### Contacts
- Industry (select)
- Region (select)
- Preferred Contact Method (select)
- Last Interaction Date (date)

### Companies
- Industry (select)
- Region (select)
- Company Size (select)
- Annual Revenue (number)
- Company Type (select)

### Leads
- Lead Channel (select) - *Website Form, Social Media, Email Campaign, etc.*
- Lead Source (text)
- Industry (select)
- Region (select)
- Budget (number)
- Interest Areas (multi-select)
- Expected Close Date (date)

## Acceptance Criteria Status

### ✅ Allow users to define custom fields for storing business-specific data
- **Implementation**: `CustomFieldDefinition` interface in `types/custom-fields.ts`
- **Example fields**: Industry, region, and lead channel defined in `examples/custom-field-definitions.ts`
- **Flexibility**: Support for 9 different data types with validation

### ✅ Enable filtering and searching using custom fields
- **Filtering**: `filterByCustomField()` and `filterByCustomFields()` functions with 9 operators
- **Searching**: `searchByCustomFields()` function for full-text search
- **Performance**: Efficient array-based filtering with TypeScript type safety

## Usage Examples

Complete usage examples are available in:
- `src/crm/examples/usage.ts` - Executable TypeScript examples
- `docs/crm/custom-fields.md` - Comprehensive documentation with examples

## Next Steps

This implementation provides the foundation for custom fields. Future enhancements could include:

1. **UI Components**: Form builders and field editors
2. **Persistence**: Database schema and storage layer
3. **API Endpoints**: REST API for CRUD operations on custom fields
4. **Field Management**: UI for creating/editing field definitions
5. **Bulk Operations**: Import/export with custom fields
6. **Advanced Search**: Boolean operators and complex queries
7. **Field Groups**: Organize fields into sections
8. **Conditional Fields**: Show/hide fields based on other values
9. **Calculated Fields**: Auto-compute values from other fields
10. **Field History**: Track changes to custom field values

## Related Documentation

- [SimpleCRM Business Requirements](../../inbox/crm.md) - Original requirements document
- [Custom Fields Guide](../../docs/crm/custom-fields.md) - Detailed usage documentation

## Testing

To test the implementation:

```typescript
// Import the usage examples
import './src/crm/examples/usage';

// The examples include console output demonstrating:
// - Creating entities with custom fields
// - Filtering by single and multiple fields
// - Searching across custom fields
// - Getting and setting field values
// - Validating field values
```

## Support

For questions or issues with custom fields:
1. Review the [Custom Fields Guide](../../docs/crm/custom-fields.md)
2. Check the [usage examples](./examples/usage.ts)
3. Refer to the [SimpleCRM BRD](../../inbox/crm.md)
