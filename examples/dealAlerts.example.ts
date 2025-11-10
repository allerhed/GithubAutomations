/**
 * Example: Basic Deal Alerts Usage
 * 
 * This example demonstrates how to use the deal alerts feature to detect
 * stalled deals in your sales pipeline.
 */

import {
  Deal,
  DealAlertConfig,
  detectStalledDeals,
  filterDeals,
  DEFAULT_ALERT_CONFIG,
} from '../src/crm';

// Sample deals data
const sampleDeals: Deal[] = [
  {
    id: '001',
    title: 'Enterprise Software License - Acme Corp',
    value: 150000,
    expectedCloseDate: new Date('2025-03-15'),
    owner: 'john.sales@company.com',
    stage: 'prospecting',
    stageEnteredAt: new Date('2025-01-01'), // 30+ days ago
    associatedCompany: 'Acme Corp',
    associatedContact: 'CEO Jane Doe',
  },
  {
    id: '002',
    title: 'Cloud Migration Services - TechStart Inc',
    value: 75000,
    expectedCloseDate: new Date('2025-02-28'),
    owner: 'sarah.sales@company.com',
    stage: 'negotiation',
    stageEnteredAt: new Date('2025-01-15'), // 15+ days ago
    associatedCompany: 'TechStart Inc',
    associatedContact: 'CTO Bob Smith',
  },
  {
    id: '003',
    title: 'Annual Support Contract - Global Systems',
    value: 50000,
    expectedCloseDate: new Date('2025-02-20'),
    owner: 'john.sales@company.com',
    stage: 'closing',
    stageEnteredAt: new Date('2025-01-28'), // Fresh, just a few days
    associatedCompany: 'Global Systems',
    associatedContact: 'CFO Alice Johnson',
  },
  {
    id: '004',
    title: 'Training Package - SmallBiz LLC',
    value: 25000,
    expectedCloseDate: new Date('2025-02-15'),
    owner: 'mike.sales@company.com',
    stage: 'proposal',
    stageEnteredAt: new Date('2024-12-15'), // Very stale, 45+ days
    associatedCompany: 'SmallBiz LLC',
    associatedContact: 'Owner Tom Brown',
  },
];

console.log('=== Deal Alerts Example ===\n');

// Example 1: Detect all stalled deals with default configuration
console.log('1. Detecting stalled deals with default configuration:');
console.log('-'.repeat(60));

const alerts = detectStalledDeals(sampleDeals);

if (alerts.length === 0) {
  console.log('✓ No stalled deals found! Pipeline is healthy.');
} else {
  console.log(`⚠️  Found ${alerts.length} stalled deal(s):\n`);
  
  alerts.forEach((alert, index) => {
    console.log(`Alert ${index + 1}:`);
    console.log(`  Deal: ${alert.deal.title}`);
    console.log(`  Owner: ${alert.deal.owner}`);
    console.log(`  Stage: ${alert.deal.stage}`);
    console.log(`  Days in Stage: ${alert.daysInStage}`);
    console.log(`  Threshold: ${alert.threshold} days`);
    console.log(`  Severity: ${alert.severity.toUpperCase()}`);
    console.log(`  Message: ${alert.message}`);
    console.log();
  });
}

// Example 2: Using custom configuration
console.log('\n2. Using custom configuration (stricter thresholds):');
console.log('-'.repeat(60));

const strictConfig: DealAlertConfig = {
  defaultThresholdDays: 15, // Stricter default
  stageThresholds: {
    'prospecting': 10,
    'qualification': 12,
    'proposal': 10,
    'negotiation': 5,
    'closing': 3,
  },
};

const strictAlerts = detectStalledDeals(sampleDeals, strictConfig);
console.log(`With stricter thresholds, found ${strictAlerts.length} stalled deal(s).\n`);

// Example 3: Filter by owner before checking
console.log('3. Checking stalled deals for a specific owner:');
console.log('-'.repeat(60));

const johnDeals = filterDeals(sampleDeals, 'john.sales@company.com');
const johnAlerts = detectStalledDeals(johnDeals);

console.log(`John has ${johnDeals.length} total deal(s)`);
console.log(`John has ${johnAlerts.length} stalled deal(s)\n`);

// Example 4: Filter by stage
console.log('4. Checking stalled deals in negotiation stage:');
console.log('-'.repeat(60));

const negotiationDeals = filterDeals(sampleDeals, undefined, 'negotiation');
const negotiationAlerts = detectStalledDeals(negotiationDeals);

console.log(`${negotiationDeals.length} deal(s) in negotiation stage`);
console.log(`${negotiationAlerts.length} of them are stalled\n`);

// Example 5: Group alerts by severity
console.log('5. Alerts grouped by severity:');
console.log('-'.repeat(60));

const criticalAlerts = alerts.filter(a => a.severity === 'critical');
const warningAlerts = alerts.filter(a => a.severity === 'warning');

console.log(`🔴 Critical Alerts: ${criticalAlerts.length}`);
criticalAlerts.forEach(alert => {
  console.log(`   - ${alert.deal.title} (${alert.daysInStage} days)`);
});

console.log(`🟡 Warning Alerts: ${warningAlerts.length}`);
warningAlerts.forEach(alert => {
  console.log(`   - ${alert.deal.title} (${alert.daysInStage} days)`);
});

// Example 6: Practical usage - Generate a report
console.log('\n6. Generate a summary report:');
console.log('-'.repeat(60));

function generateAlertReport(deals: Deal[]): void {
  const alerts = detectStalledDeals(deals, DEFAULT_ALERT_CONFIG);
  
  console.log('STALLED DEALS REPORT');
  console.log('Generated:', new Date().toISOString());
  console.log();
  console.log(`Total Deals: ${deals.length}`);
  console.log(`Stalled Deals: ${alerts.length} (${((alerts.length / deals.length) * 100).toFixed(1)}%)`);
  console.log();
  
  // Group by owner
  const byOwner = new Map<string, number>();
  alerts.forEach(alert => {
    const owner = alert.deal.owner;
    byOwner.set(owner, (byOwner.get(owner) || 0) + 1);
  });
  
  console.log('Stalled Deals by Owner:');
  byOwner.forEach((count, owner) => {
    console.log(`  ${owner}: ${count}`);
  });
  
  console.log();
  console.log('Action Required:');
  console.log('  - Review each stalled deal');
  console.log('  - Contact customers to re-engage');
  console.log('  - Update deal status or close if no longer viable');
}

generateAlertReport(sampleDeals);

console.log('\n=== End of Example ===');
