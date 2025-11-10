# CRM Dashboards and Reports

This module provides customizable dashboards and reports for monitoring and forecasting sales metrics.

## Features

### 1. Dashboard with Visual Indicators

The dashboard provides comprehensive visual indicators of:
- **Pipeline Value**: Total value of all active deals
- **Deal Count by Stage**: Number of deals in each pipeline stage
- **Conversion Rates**: Percentage of deals moving between stages
- **Visual Health Indicators**: Color-coded pipeline health, conversion trends, and forecast confidence

### 2. Forecasting Capabilities

Forecasting is based on:
- **Weighted Deals**: Each deal's value multiplied by its probability
- **Expected Close Dates**: Deals grouped by quarter for revenue projection
- **Confidence Levels**: Average probability across forecast periods

### 3. Export Reports

Reports can be exported in:
- **CSV Format**: Compatible with Excel, Google Sheets, and other tools
- **Excel-Compatible CSV**: Optimized formatting for Microsoft Excel

## Usage

### Basic Dashboard Generation

```typescript
import { DashboardService, Deal, PipelineStage } from './crm';

// Sample deals data
const deals: Deal[] = [
  {
    id: '1',
    name: 'Enterprise Software Deal',
    value: 50000,
    stage: PipelineStage.PROPOSAL,
    probability: 75,
    expectedCloseDate: new Date('2025-12-15'),
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-11-01'),
    owner: 'John Doe'
  },
  {
    id: '2',
    name: 'SaaS Subscription',
    value: 25000,
    stage: PipelineStage.NEGOTIATION,
    probability: 90,
    expectedCloseDate: new Date('2025-11-30'),
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2025-11-05'),
    owner: 'Jane Smith'
  }
];

// Generate dashboard
const dashboardService = new DashboardService();
const dashboard = dashboardService.generateDashboard(deals);

console.log('Pipeline Summary:', dashboard.summary);
console.log('Stage Breakdown:', dashboard.stageBreakdown);
console.log('Forecast:', dashboard.forecast);

// Get visual indicators
const indicators = dashboardService.getVisualIndicators(dashboard);
console.log('Health Indicators:', indicators);
```

### Exporting Reports

```typescript
import { ExportService } from './crm';

const exportService = new ExportService();

// Export deals to CSV
const dealsCSV = exportService.exportDealsToCSV(deals);
console.log(dealsCSV);

// Export dashboard to CSV
const dashboardCSV = exportService.exportDashboardToCSV(dashboard);
console.log(dashboardCSV);

// Save to file (Node.js)
await exportService.saveToFile(dashboardCSV, 'dashboard-report.csv');

// Export specific metrics
const stageMetricsCSV = exportService.exportStageMetricsToCSV(dashboard.stageBreakdown);
const forecastCSV = exportService.exportForecastToCSV(dashboard.forecast);
```

## Data Models

### Deal
Represents a sales opportunity in the pipeline.

```typescript
interface Deal {
  id: string;
  name: string;
  value: number;
  stage: PipelineStage;
  probability: number; // 0-100
  expectedCloseDate: Date;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
}
```

### Pipeline Stages
```typescript
enum PipelineStage {
  LEAD = 'Lead',
  QUALIFIED = 'Qualified',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost'
}
```

### Dashboard Data
```typescript
interface DashboardData {
  summary: PipelineMetrics;
  stageBreakdown: StageMetrics[];
  forecast: ForecastData[];
  lastUpdated: Date;
}
```

## Metrics Explained

### Pipeline Metrics
- **Total Value**: Sum of all deal values in the pipeline
- **Deal Count**: Number of active deals
- **Average Deal Value**: Mean value across all deals
- **Weighted Value**: Sum of (deal value × probability) for all deals

### Stage Metrics
- **Deal Count**: Number of deals at this stage
- **Total Value**: Combined value of deals at this stage
- **Average Deal Value**: Mean value of deals at this stage
- **Conversion Rate**: Percentage of deals that progress to the next stage

### Forecast Data
- **Period**: Time period (e.g., "2025-Q4")
- **Weighted Value**: Expected revenue based on probabilities
- **Deal Count**: Number of deals expected to close
- **Average Probability**: Mean probability across deals in period
- **Expected Revenue**: Forecasted revenue for the period

## Visual Indicators

The dashboard provides three key health indicators:

1. **Pipeline Health**
   - 🟢 Healthy (>60% weighted ratio)
   - 🟡 Moderate (40-60% weighted ratio)
   - 🔴 At Risk (<40% weighted ratio)

2. **Conversion Trend**
   - 📈 Strong (>50% average conversion)
   - ➡️ Steady (30-50% average conversion)
   - 📉 Weak (<30% average conversion)

3. **Forecast Confidence**
   - ✅ High (>60% average probability)
   - ⚠️ Medium (40-60% average probability)
   - ❌ Low (<40% average probability)

## CSV Export Format

### Dashboard Report Structure
The exported CSV contains three sections:

1. **Pipeline Summary**: Overall metrics
2. **Stage Breakdown**: Metrics by pipeline stage
3. **Forecast**: Revenue projections by period

All numeric values are formatted with 2 decimal places for consistency.

### Excel Compatibility
The CSV format is fully compatible with Microsoft Excel and can be opened directly. Special characters are properly escaped to prevent parsing issues.

## Integration

This module can be integrated into:
- Command-line tools
- Web applications
- API services
- Automated reporting workflows
- Business intelligence systems

For integration examples, see the `examples` directory.
