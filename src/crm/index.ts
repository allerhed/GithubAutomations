/**
 * SimpleCRM Custom Fields Module
 * 
 * This module provides custom field functionality for contacts, companies,
 * and leads in the SimpleCRM system.
 * 
 * @example
 * ```typescript
 * import {
 *   Contact,
 *   CustomFieldType,
 *   filterByCustomField,
 *   contactCustomFields
 * } from './crm';
 * 
 * // Create a contact with custom fields
 * const contact: Contact = {
 *   id: '1',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com',
 *   status: 'active',
 *   customFields: [
 *     { fieldId: 'contact_industry', value: 'Technology' },
 *     { fieldId: 'contact_region', value: 'North America' }
 *   ],
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * 
 * // Filter contacts by custom field
 * const techContacts = filterByCustomField(contacts, {
 *   fieldId: 'contact_industry',
 *   operator: 'equals',
 *   value: 'Technology'
 * });
 * ```
 */

// Types
export {
  CustomFieldType,
  CustomFieldDefinition,
  CustomFieldValue,
  EntityType
} from './types/custom-fields';

export {
  EntityWithCustomFields,
  Contact,
  Company,
  Lead
} from './types/entities';

// Utils
export {
  CustomFieldFilter,
  getCustomFieldValue,
  setCustomFieldValue,
  filterByCustomField,
  filterByCustomFields,
  searchByCustomFields,
  validateCustomFieldValue,
  validateEntityCustomFields
} from './utils/custom-fields';

// Example definitions
export {
  contactCustomFields,
  companyCustomFields,
  leadCustomFields,
  getCustomFieldsByEntityType
} from './examples/custom-field-definitions';
