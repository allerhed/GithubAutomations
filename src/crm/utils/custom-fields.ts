/**
 * Custom Fields Utilities
 * 
 * Utility functions for working with custom fields, including
 * filtering and searching entities based on custom field values.
 */

import { EntityWithCustomFields } from '../types/entities';
import { CustomFieldDefinition, CustomFieldType, CustomFieldValue } from '../types/custom-fields';

/**
 * Filter options for custom field queries
 */
export interface CustomFieldFilter {
  /** Field ID to filter by */
  fieldId: string;
  
  /** Operator for comparison */
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  
  /** Value to compare against */
  value: any;
}

/**
 * Get the value of a custom field from an entity
 */
export function getCustomFieldValue(
  entity: EntityWithCustomFields,
  fieldId: string
): any | undefined {
  const field = entity.customFields.find(f => f.fieldId === fieldId);
  return field?.value;
}

/**
 * Set the value of a custom field on an entity
 */
export function setCustomFieldValue(
  entity: EntityWithCustomFields,
  fieldId: string,
  value: any
): EntityWithCustomFields {
  const existingIndex = entity.customFields.findIndex(f => f.fieldId === fieldId);
  
  if (existingIndex >= 0) {
    // Update existing field
    entity.customFields[existingIndex].value = value;
  } else {
    // Add new field
    entity.customFields.push({ fieldId, value });
  }
  
  entity.updatedAt = new Date();
  return entity;
}

/**
 * Filter entities based on custom field criteria
 */
export function filterByCustomField<T extends EntityWithCustomFields>(
  entities: T[],
  filter: CustomFieldFilter
): T[] {
  return entities.filter(entity => {
    const value = getCustomFieldValue(entity, filter.fieldId);
    
    if (value === undefined) {
      return false;
    }
    
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      
      case 'contains':
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
      
      case 'startsWith':
        return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
      
      case 'endsWith':
        return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
      
      case 'gt':
        return value > filter.value;
      
      case 'lt':
        return value < filter.value;
      
      case 'gte':
        return value >= filter.value;
      
      case 'lte':
        return value <= filter.value;
      
      case 'in':
        if (Array.isArray(filter.value)) {
          return filter.value.includes(value);
        }
        if (Array.isArray(value)) {
          return value.some(v => filter.value.includes(v));
        }
        return false;
      
      default:
        return false;
    }
  });
}

/**
 * Filter entities by multiple custom field criteria (AND logic)
 */
export function filterByCustomFields<T extends EntityWithCustomFields>(
  entities: T[],
  filters: CustomFieldFilter[]
): T[] {
  return filters.reduce(
    (filtered, filter) => filterByCustomField(filtered, filter),
    entities
  );
}

/**
 * Search entities by custom field values
 * Searches all searchable text-based fields for the query string
 */
export function searchByCustomFields<T extends EntityWithCustomFields>(
  entities: T[],
  query: string,
  searchableFieldIds: string[]
): T[] {
  const lowerQuery = query.toLowerCase();
  
  return entities.filter(entity => {
    return searchableFieldIds.some(fieldId => {
      const value = getCustomFieldValue(entity, fieldId);
      if (value === undefined || value === null) {
        return false;
      }
      return String(value).toLowerCase().includes(lowerQuery);
    });
  });
}

/**
 * Validate a custom field value against its definition
 */
export function validateCustomFieldValue(
  value: any,
  definition: CustomFieldDefinition
): { valid: boolean; error?: string } {
  // Check required
  if (definition.required && (value === undefined || value === null || value === '')) {
    return { valid: false, error: `Field '${definition.name}' is required` };
  }
  
  // If not required and empty, it's valid
  if (!definition.required && (value === undefined || value === null || value === '')) {
    return { valid: true };
  }
  
  // Type-specific validation
  switch (definition.type) {
    case CustomFieldType.NUMBER:
      if (typeof value !== 'number' && isNaN(Number(value))) {
        return { valid: false, error: `Field '${definition.name}' must be a number` };
      }
      break;
    
    case CustomFieldType.BOOLEAN:
      if (typeof value !== 'boolean') {
        return { valid: false, error: `Field '${definition.name}' must be a boolean` };
      }
      break;
    
    case CustomFieldType.DATE:
      if (!(value instanceof Date) && isNaN(Date.parse(value))) {
        return { valid: false, error: `Field '${definition.name}' must be a valid date` };
      }
      break;
    
    case CustomFieldType.EMAIL:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return { valid: false, error: `Field '${definition.name}' must be a valid email` };
      }
      break;
    
    case CustomFieldType.URL:
      try {
        new URL(String(value));
      } catch {
        return { valid: false, error: `Field '${definition.name}' must be a valid URL` };
      }
      break;
    
    case CustomFieldType.SELECT:
      if (definition.options && !definition.options.includes(String(value))) {
        return { valid: false, error: `Field '${definition.name}' must be one of: ${definition.options.join(', ')}` };
      }
      break;
    
    case CustomFieldType.MULTI_SELECT:
      if (!Array.isArray(value)) {
        return { valid: false, error: `Field '${definition.name}' must be an array` };
      }
      if (definition.options) {
        const invalidValues = value.filter(v => !definition.options!.includes(String(v)));
        if (invalidValues.length > 0) {
          return { valid: false, error: `Field '${definition.name}' contains invalid values: ${invalidValues.join(', ')}` };
        }
      }
      break;
  }
  
  return { valid: true };
}

/**
 * Validate all custom fields on an entity
 */
export function validateEntityCustomFields(
  entity: EntityWithCustomFields,
  definitions: CustomFieldDefinition[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check all field definitions
  for (const definition of definitions) {
    const value = getCustomFieldValue(entity, definition.id);
    const result = validateCustomFieldValue(value, definition);
    
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
