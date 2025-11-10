// Integration Examples for SimpleCRM API

import {
  importData,
  exportData,
  configureEmailIntegration,
  configureCalendarIntegration,
  configureAccountingIntegration,
  configureProjectManagementIntegration,
  type Contact,
  type Company,
  type Deal,
} from '../src/api';

/**
 * Example 1: Import contacts from an external source
 */
async function importContactsExample() {
  const contacts: Contact[] = [
    {
      id: 'c1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      status: 'lead',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'c2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      company: 'Beta Inc',
      status: 'contact',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const result = await importData({
    type: 'contacts',
    data: contacts,
    overwriteExisting: false,
  });

  console.log('Import Result:', result);
}

/**
 * Example 2: Export deals with filters
 */
async function exportDealsExample() {
  const result = await exportData({
    type: 'deals',
    format: 'json',
    filters: {
      dateFrom: new Date('2025-01-01'),
      dateTo: new Date('2025-12-31'),
      owner: 'user123',
    },
  });

  console.log('Export Result:', result);
}

/**
 * Example 3: Configure Gmail integration
 */
async function setupGmailIntegration() {
  const result = await configureEmailIntegration({
    provider: 'gmail',
    enabled: true,
    syncEnabled: true,
    trackOpens: true,
    trackClicks: true,
    credentials: {
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
    },
  });

  console.log('Gmail Integration:', result);
}

/**
 * Example 4: Configure Google Calendar sync
 */
async function setupCalendarSync() {
  const result = await configureCalendarIntegration({
    provider: 'google_calendar',
    enabled: true,
    syncDirection: 'bidirectional',
    autoCreateMeetings: true,
    credentials: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  });

  console.log('Calendar Integration:', result);
}

/**
 * Example 5: Configure QuickBooks integration
 */
async function setupQuickBooksIntegration() {
  const result = await configureAccountingIntegration({
    provider: 'quickbooks',
    enabled: true,
    syncInvoices: true,
    syncPayments: true,
    credentials: {
      companyId: process.env.QUICKBOOKS_COMPANY_ID,
      clientId: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
    },
  });

  console.log('QuickBooks Integration:', result);
}

/**
 * Example 6: Configure Asana integration
 */
async function setupAsanaIntegration() {
  const result = await configureProjectManagementIntegration({
    provider: 'asana',
    enabled: true,
    autoCreateTasks: true,
    syncDeadlines: true,
    credentials: {
      apiToken: process.env.ASANA_API_TOKEN,
      workspaceId: process.env.ASANA_WORKSPACE_ID,
    },
  });

  console.log('Asana Integration:', result);
}

/**
 * Example 7: Bulk import companies
 */
async function importCompaniesExample() {
  const companies: Company[] = [
    {
      id: 'comp1',
      name: 'Acme Corporation',
      industry: 'Technology',
      website: 'https://acme.com',
      employees: 500,
      revenue: 5000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'comp2',
      name: 'Beta Industries',
      industry: 'Manufacturing',
      website: 'https://beta.com',
      employees: 200,
      revenue: 2000000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const result = await importData({
    type: 'companies',
    data: companies,
  });

  console.log('Companies Import Result:', result);
}

/**
 * Example 8: Import deals with relationships
 */
async function importDealsExample() {
  const deals: Deal[] = [
    {
      id: 'd1',
      title: 'Enterprise License Deal',
      value: 50000,
      currency: 'USD',
      stage: 'negotiation',
      probability: 75,
      expectedCloseDate: new Date('2025-12-31'),
      owner: 'user123',
      contactId: 'c1',
      companyId: 'comp1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const result = await importData({
    type: 'deals',
    data: deals,
  });

  console.log('Deals Import Result:', result);
}

// Run examples
async function runExamples() {
  console.log('=== SimpleCRM API Integration Examples ===\n');

  try {
    console.log('1. Importing Contacts...');
    await importContactsExample();
    console.log('\n');

    console.log('2. Exporting Deals...');
    await exportDealsExample();
    console.log('\n');

    console.log('3. Setting up Gmail Integration...');
    await setupGmailIntegration();
    console.log('\n');

    console.log('4. Setting up Calendar Sync...');
    await setupCalendarSync();
    console.log('\n');

    console.log('5. Setting up QuickBooks Integration...');
    await setupQuickBooksIntegration();
    console.log('\n');

    console.log('6. Setting up Asana Integration...');
    await setupAsanaIntegration();
    console.log('\n');

    console.log('7. Importing Companies...');
    await importCompaniesExample();
    console.log('\n');

    console.log('8. Importing Deals...');
    await importDealsExample();
    console.log('\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run examples
// runExamples();

export {
  importContactsExample,
  exportDealsExample,
  setupGmailIntegration,
  setupCalendarSync,
  setupQuickBooksIntegration,
  setupAsanaIntegration,
  importCompaniesExample,
  importDealsExample,
};
