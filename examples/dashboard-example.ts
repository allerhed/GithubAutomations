/**
 * CRM Dashboard Example
 * Demonstrates how to use the dashboard and reporting features
 */

import { DashboardService, ExportService, Deal, PipelineStage } from '../src/crm';

// Sample sales data
const sampleDeals: Deal[] = [
  {
    id: 'DEAL-001',
    name: 'Enterprise Software License - Acme Corp',
    value: 150000,
    stage: PipelineStage.NEGOTIATION,
    probability: 85,
    expectedCloseDate: new Date('2025-12-15'),
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-11-10'),
    owner: 'Sarah Johnson'
  },
  {
    id: 'DEAL-002',
    name: 'Cloud Migration Services - TechStart Inc',
    value: 75000,
    stage: PipelineStage.PROPOSAL,
    probability: 60,
    expectedCloseDate: new Date('2026-01-20'),
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-11-08'),
    owner: 'Michael Chen'
  },
  {
    id: 'DEAL-003',
    name: 'Annual Support Contract - GlobalCo',
    value: 45000,
    stage: PipelineStage.QUALIFIED,
    probability: 70,
    expectedCloseDate: new Date('2025-12-30'),
    createdAt: new Date('2025-10-20'),
    updatedAt: new Date('2025-11-05'),
    owner: 'Sarah Johnson'
  },
  {
    id: 'DEAL-004',
    name: 'Consulting Package - StartupXYZ',
    value: 30000,
    stage: PipelineStage.LEAD,
    probability: 40,
    expectedCloseDate: new Date('2026-02-15'),
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-09'),
    owner: 'David Brown'
  },
  {
    id: 'DEAL-005',
    name: 'Integration Services - MedTech Solutions',
    value: 95000,
    stage: PipelineStage.PROPOSAL,
    probability: 75,
    expectedCloseDate: new Date('2026-01-10'),
    createdAt: new Date('2025-09-20'),
    updatedAt: new Date('2025-11-10'),
    owner: 'Michael Chen'
  },
  {
    id: 'DEAL-006',
    name: 'Training and Onboarding - FinServe Ltd',
    value: 25000,
    stage: PipelineStage.NEGOTIATION,
    probability: 90,
    expectedCloseDate: new Date('2025-11-30'),
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-11-10'),
    owner: 'David Brown'
  },
  {
    id: 'DEAL-007',
    name: 'Custom Development - RetailChain',
    value: 120000,
    stage: PipelineStage.QUALIFIED,
    probability: 55,
    expectedCloseDate: new Date('2026-03-01'),
    createdAt: new Date('2025-10-25'),
    updatedAt: new Date('2025-11-08'),
    owner: 'Sarah Johnson'
  },
  {
    id: 'DEAL-008',
    name: 'SaaS Subscription - E-Commerce Plus',
    value: 18000,
    stage: PipelineStage.LEAD,
    probability: 50,
    expectedCloseDate: new Date('2026-01-25'),
    createdAt: new Date('2025-11-05'),
    updatedAt: new Date('2025-11-09'),
    owner: 'Michael Chen'
  }
];

async function runExample() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('       CRM DASHBOARD & REPORTING EXAMPLE');
  console.log('═══════════════════════════════════════════════════════\n');

  // Initialize services
  const dashboardService = new DashboardService();
  const exportService = new ExportService();

  // Generate dashboard data
  console.log('📊 Generating Dashboard...\n');
  const dashboard = dashboardService.generateDashboard(sampleDeals);

  // Display pipeline summary
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│           PIPELINE SUMMARY                          │');
  console.log('└─────────────────────────────────────────────────────┘');
  console.log(`  Total Pipeline Value:    $${dashboard.summary.totalValue.toLocaleString()}`);
  console.log(`  Active Deal Count:       ${dashboard.summary.dealCount}`);
  console.log(`  Average Deal Value:      $${dashboard.summary.averageDealValue.toLocaleString()}`);
  console.log(`  Weighted Pipeline Value: $${dashboard.summary.weightedValue.toLocaleString()}`);
  console.log('');

  // Display stage breakdown
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│           STAGE BREAKDOWN                           │');
  console.log('└─────────────────────────────────────────────────────┘');
  dashboard.stageBreakdown.forEach(stage => {
    console.log(`\n  ${stage.stage}:`);
    console.log(`    Deals:           ${stage.dealCount}`);
    console.log(`    Total Value:     $${stage.totalValue.toLocaleString()}`);
    console.log(`    Avg Deal Value:  $${stage.averageDealValue.toLocaleString()}`);
    if (stage.conversionRate !== undefined) {
      console.log(`    Conversion Rate: ${stage.conversionRate.toFixed(1)}%`);
    }
  });
  console.log('');

  // Display forecast
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│           REVENUE FORECAST                          │');
  console.log('└─────────────────────────────────────────────────────┘');
  dashboard.forecast.forEach(forecast => {
    console.log(`\n  ${forecast.period}:`);
    console.log(`    Expected Deals:      ${forecast.dealCount}`);
    console.log(`    Weighted Value:      $${forecast.weightedValue.toLocaleString()}`);
    console.log(`    Expected Revenue:    $${forecast.expectedRevenue.toLocaleString()}`);
    console.log(`    Avg Probability:     ${forecast.averageProbability.toFixed(1)}%`);
  });
  console.log('');

  // Display visual indicators
  const indicators = dashboardService.getVisualIndicators(dashboard);
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│           HEALTH INDICATORS                         │');
  console.log('└─────────────────────────────────────────────────────┘');
  console.log(`  Pipeline Health:      ${indicators.pipelineHealth}`);
  console.log(`  Conversion Trend:     ${indicators.conversionTrend}`);
  console.log(`  Forecast Confidence:  ${indicators.forecastConfidence}`);
  console.log('');

  // Export examples
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│           EXPORT EXAMPLES                           │');
  console.log('└─────────────────────────────────────────────────────┘');

  console.log('\n📄 Exporting to CSV formats...\n');

  // Export deals
  const dealsCSV = exportService.exportDealsToCSV(sampleDeals);
  console.log('  ✓ Deals exported to CSV format');
  console.log(`    Size: ${dealsCSV.length} bytes`);

  // Export dashboard
  const dashboardCSV = exportService.exportDashboardToCSV(dashboard);
  console.log('  ✓ Dashboard exported to CSV format');
  console.log(`    Size: ${dashboardCSV.length} bytes`);

  // Export stage metrics
  const stageMetricsCSV = exportService.exportStageMetricsToCSV(dashboard.stageBreakdown);
  console.log('  ✓ Stage metrics exported to CSV format');
  console.log(`    Size: ${stageMetricsCSV.length} bytes`);

  // Export forecast
  const forecastCSV = exportService.exportForecastToCSV(dashboard.forecast);
  console.log('  ✓ Forecast exported to CSV format');
  console.log(`    Size: ${forecastCSV.length} bytes`);

  // Save files (Node.js environment)
  if (typeof window === 'undefined') {
    console.log('\n💾 Saving exports to files...\n');
    try {
      await exportService.saveToFile(dealsCSV, 'deals-export.csv');
      console.log('  ✓ Saved: exports/deals-export.csv');

      await exportService.saveToFile(dashboardCSV, 'dashboard-report.csv');
      console.log('  ✓ Saved: exports/dashboard-report.csv');

      await exportService.saveToFile(stageMetricsCSV, 'stage-metrics.csv');
      console.log('  ✓ Saved: exports/stage-metrics.csv');

      await exportService.saveToFile(forecastCSV, 'forecast-report.csv');
      console.log('  ✓ Saved: exports/forecast-report.csv');
    } catch (error) {
      console.log('  ⚠️  File saving not available in this environment');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Dashboard generation and export completed!');
  console.log('═══════════════════════════════════════════════════════\n');

  // Show sample CSV output
  console.log('📋 Sample Dashboard CSV Output (first 20 lines):\n');
  console.log(dashboardCSV.split('\n').slice(0, 20).join('\n'));
  console.log('\n... (truncated)\n');
}

// Run the example
if (require.main === module) {
  runExample().catch(console.error);
}

export { runExample, sampleDeals };
