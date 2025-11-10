// Main API entry point and route definitions
export { VERSION } from '../utils/version';

// Export all API types
export type {
  Contact,
  Company,
  Deal,
  Activity,
  ImportRequest,
  ExportRequest,
  ExportResponse,
  APIResponse,
  IntegrationConfig,
  EmailIntegration,
  CalendarIntegration,
  AccountingIntegration,
  ProjectManagementIntegration,
} from './types';

// Export data endpoints
export {
  importData,
  exportData,
  importContactsFromCSV,
  exportContactsToCSV,
} from './endpoints/data';

// Export integration endpoints
export {
  configureEmailIntegration,
  configureCalendarIntegration,
  configureAccountingIntegration,
  configureProjectManagementIntegration,
  listIntegrations,
  getIntegration,
  deleteIntegration,
  testIntegration,
} from './endpoints/integrations';

// Export auth utilities
export type { APIKey, RateLimitConfig, RateLimitStatus } from './auth';
export {
  validateAPIKey,
  checkRateLimit,
  recordAPIRequest,
  generateAPIKey,
  createAPIKey,
  revokeAPIKey,
} from './auth';

/**
 * API Routes
 *
 * Data Import/Export:
 * - POST   /api/v1/import                 - Import data (contacts, companies, deals)
 * - POST   /api/v1/export                 - Export data with filters
 * - POST   /api/v1/import/contacts/csv    - Import contacts from CSV
 * - GET    /api/v1/export/contacts/csv    - Export contacts to CSV
 *
 * Integrations:
 * - GET    /api/v1/integrations           - List all integrations
 * - GET    /api/v1/integrations/:type     - Get specific integration
 * - POST   /api/v1/integrations/email     - Configure email integration
 * - POST   /api/v1/integrations/calendar  - Configure calendar integration
 * - POST   /api/v1/integrations/accounting - Configure accounting integration
 * - POST   /api/v1/integrations/project-management - Configure project management integration
 * - POST   /api/v1/integrations/:type/test - Test integration connection
 * - DELETE /api/v1/integrations/:type     - Delete integration
 *
 * Authentication:
 * - POST   /api/v1/keys                   - Create new API key
 * - DELETE /api/v1/keys/:key              - Revoke API key
 */

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;
