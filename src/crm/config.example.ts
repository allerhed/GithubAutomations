/**
 * Example configuration for lead assignment rules
 */

import { AssignmentRule } from './types';

/**
 * Example assignment rules based on geography and product line
 */
export const exampleRules: AssignmentRule[] = [
  // Geography-based rules
  {
    id: 'rule_geo_west',
    name: 'West Coast Assignment',
    priority: 1,
    enabled: true,
    assignTo: 'sales_rep_west_001',
    conditions: [
      {
        field: 'geography',
        operator: 'in',
        value: ['California', 'Oregon', 'Washington', 'Nevada']
      }
    ]
  },
  {
    id: 'rule_geo_east',
    name: 'East Coast Assignment',
    priority: 2,
    enabled: true,
    assignTo: 'sales_rep_east_001',
    conditions: [
      {
        field: 'geography',
        operator: 'in',
        value: ['New York', 'Massachusetts', 'Pennsylvania', 'New Jersey']
      }
    ]
  },
  
  // Product line-based rules
  {
    id: 'rule_product_enterprise',
    name: 'Enterprise Product Line',
    priority: 3,
    enabled: true,
    assignTo: 'sales_rep_enterprise_001',
    conditions: [
      {
        field: 'productInterest',
        operator: 'contains',
        value: 'enterprise'
      }
    ]
  },
  {
    id: 'rule_product_smb',
    name: 'SMB Product Line',
    priority: 4,
    enabled: true,
    assignTo: 'sales_rep_smb_001',
    conditions: [
      {
        field: 'productInterest',
        operator: 'contains',
        value: 'small business'
      }
    ]
  },
  
  // Combined rules (geography + product)
  {
    id: 'rule_combined_west_enterprise',
    name: 'West Coast Enterprise',
    priority: 0, // Higher priority (lower number)
    enabled: true,
    assignTo: 'sales_rep_west_enterprise_001',
    conditions: [
      {
        field: 'geography',
        operator: 'in',
        value: ['California', 'Oregon', 'Washington']
      },
      {
        field: 'productInterest',
        operator: 'contains',
        value: 'enterprise'
      }
    ]
  },
  
  // Default fallback rule
  {
    id: 'rule_default',
    name: 'Default Assignment',
    priority: 999,
    enabled: true,
    assignTo: 'sales_rep_default_001',
    conditions: [] // Matches all leads
  }
];

/**
 * Example sales representatives
 */
export const exampleSalesReps = [
  {
    id: 'sales_rep_west_001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    territories: ['California', 'Oregon', 'Washington', 'Nevada']
  },
  {
    id: 'sales_rep_east_001',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    territories: ['New York', 'Massachusetts', 'Pennsylvania', 'New Jersey']
  },
  {
    id: 'sales_rep_enterprise_001',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    productLines: ['Enterprise Solutions', 'Custom Development']
  },
  {
    id: 'sales_rep_smb_001',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    productLines: ['Small Business Package', 'Starter Plan']
  },
  {
    id: 'sales_rep_west_enterprise_001',
    name: 'David Chen',
    email: 'david.chen@example.com',
    territories: ['California', 'Oregon', 'Washington'],
    productLines: ['Enterprise Solutions']
  },
  {
    id: 'sales_rep_default_001',
    name: 'Alex Brown',
    email: 'alex.brown@example.com',
    territories: ['All Others']
  }
];
