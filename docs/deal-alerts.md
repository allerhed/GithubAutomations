# Deal Alerts for Stalled Deals

## Overview

The Deal Alerts feature provides automated detection and notification of deals that have remained in a single stage for too long. This helps improve deal flow through the sales pipeline and prevents opportunities from going cold.

## Features

- **Automatic Detection**: Identifies deals that have stalled in any stage
- **Configurable Thresholds**: Set default and stage-specific time thresholds
- **Severity Levels**: Alerts are marked as 'warning' or 'critical' based on how long they've been stalled
- **Flexible Filtering**: Filter deals by owner, stage, or other criteria before checking for staleness
- **Detailed Messages**: Each alert includes comprehensive information about the stalled deal

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```typescript
import { detectStalledDeals, Deal } from './src/crm';

// Example deals data
const deals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise Software Deal',
    value: 100000,
    expectedCloseDate: new Date('2025-03-01'),
    owner: 'sales@company.com',
    stage: 'negotiation',
    stageEnteredAt: new Date('2025-01-01'), // 30 days ago
  },
];

// Detect stalled deals with default configuration
const alerts = detectStalledDeals(deals);

alerts.forEach(alert => {
  console.log(alert.message);
  console.log(`Severity: ${alert.severity}`);
  console.log(`Days in stage: ${alert.daysInStage}`);
});
```

### Custom Configuration

```typescript
import { detectStalledDeals, DealAlertConfig } from './src/crm';

// Define custom thresholds
const customConfig: DealAlertConfig = {
  defaultThresholdDays: 30,
  stageThresholds: {
    'prospecting': 14,      // 2 weeks
    'qualification': 21,    // 3 weeks
    'proposal': 14,         // 2 weeks
    'negotiation': 7,       // 1 week
    'closing': 7,           // 1 week
  },
};

const alerts = detectStalledDeals(deals, customConfig);
```

### Filtering Deals

```typescript
import { filterDeals } from './src/crm';

// Filter by owner before checking for stalled deals
const johnDeals = filterDeals(deals, 'john@company.com');
const johnsAlerts = detectStalledDeals(johnDeals);

// Filter by stage
const negotiationDeals = filterDeals(deals, undefined, 'negotiation');
const negotiationAlerts = detectStalledDeals(negotiationDeals);

// Filter by both owner and stage
const specificDeals = filterDeals(deals, 'john@company.com', 'negotiation');
```

## Configuration

### Default Configuration

The system comes with sensible defaults:

```typescript
{
  defaultThresholdDays: 30,
  stageThresholds: {
    'prospecting': 14,
    'qualification': 21,
    'proposal': 14,
    'negotiation': 7,
    'closing': 7,
  }
}
```

### Stage-Specific Thresholds

Stage-specific thresholds override the default threshold for that particular stage. This allows you to have different expectations for different parts of your sales pipeline.

For example:
- Early stages like 'prospecting' might allow longer durations (14 days)
- Later stages like 'negotiation' should move faster (7 days)

## Alert Severity Levels

Alerts have two severity levels:

- **warning**: Deal has exceeded the threshold but by less than the threshold amount
  - Example: If threshold is 14 days, deals at 15-27 days are 'warning'
- **critical**: Deal has exceeded the threshold by more than the threshold amount
  - Example: If threshold is 14 days, deals at 28+ days are 'critical'

## API Reference

### Functions

#### `detectStalledDeals(deals, config?, currentDate?)`

Detects stalled deals based on configurable thresholds.

**Parameters:**
- `deals: Deal[]` - Array of deals to check
- `config?: DealAlertConfig` - Optional configuration (uses defaults if not provided)
- `currentDate?: Date` - Optional current date for testing (uses `new Date()` if not provided)

**Returns:** `DealAlert[]` - Array of alerts for stalled deals

#### `calculateDaysInStage(stageEnteredAt, currentDate)`

Calculates the number of days a deal has been in its current stage.

**Parameters:**
- `stageEnteredAt: Date` - Date when the deal entered the current stage
- `currentDate: Date` - Current date for calculation

**Returns:** `number` - Number of days in the current stage

#### `getThresholdForStage(stageId, config)`

Gets the threshold for a specific stage.

**Parameters:**
- `stageId: string` - Stage identifier
- `config: DealAlertConfig` - Alert configuration

**Returns:** `number` - Threshold in days for the stage

#### `filterDeals(deals, owner?, stage?)`

Filters deals by specific criteria.

**Parameters:**
- `deals: Deal[]` - Array of deals
- `owner?: string` - Optional: filter by owner
- `stage?: string` - Optional: filter by stage

**Returns:** `Deal[]` - Filtered array of deals

### Types

#### `Deal`

```typescript
interface Deal {
  id: string;
  title: string;
  value: number;
  expectedCloseDate: Date;
  owner: string;
  stage: string;
  stageEnteredAt: Date;
  associatedContact?: string;
  associatedCompany?: string;
}
```

#### `DealAlertConfig`

```typescript
interface DealAlertConfig {
  defaultThresholdDays: number;
  stageThresholds?: Record<string, number>;
}
```

#### `DealAlert`

```typescript
interface DealAlert {
  deal: Deal;
  daysInStage: number;
  threshold: number;
  message: string;
  severity: 'warning' | 'critical';
}
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

Output will be in the `dist/` directory.

## Integration Example

### Daily Alert Notification System

```typescript
import { detectStalledDeals, Deal, DealAlert } from './src/crm';

async function sendDailyAlertReport() {
  // Fetch deals from your CRM database
  const deals: Deal[] = await fetchDealsFromDatabase();
  
  // Detect stalled deals
  const alerts = detectStalledDeals(deals);
  
  // Group alerts by owner
  const alertsByOwner = groupBy(alerts, alert => alert.deal.owner);
  
  // Send notifications
  for (const [owner, ownerAlerts] of Object.entries(alertsByOwner)) {
    await sendEmailNotification(owner, {
      subject: `${ownerAlerts.length} Stalled Deal Alert(s)`,
      alerts: ownerAlerts,
    });
  }
}

// Run daily at 9 AM
scheduleDaily('9:00 AM', sendDailyAlertReport);
```

### Dashboard Integration

```typescript
import { detectStalledDeals, filterDeals } from './src/crm';

function getDashboardData(userId: string) {
  const allDeals = fetchAllDeals();
  const userDeals = filterDeals(allDeals, userId);
  const alerts = detectStalledDeals(userDeals);
  
  return {
    totalDeals: userDeals.length,
    stalledDeals: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    warningAlerts: alerts.filter(a => a.severity === 'warning').length,
    alerts: alerts,
  };
}
```

## Best Practices

1. **Set Realistic Thresholds**: Configure thresholds based on your actual sales cycle data
2. **Monitor Regularly**: Check for stalled deals at least daily
3. **Take Action**: Use alerts as triggers to reach out to customers or re-engage deals
4. **Review and Adjust**: Periodically review threshold settings and adjust based on results
5. **Team Communication**: Share alerts with sales managers and team leads
6. **Track Improvements**: Monitor how alert response times affect deal closure rates

## Troubleshooting

### No Alerts Being Generated

- Verify that `stageEnteredAt` dates are set correctly on your deals
- Check that your configuration thresholds are appropriate for your sales cycle
- Ensure the current date is being calculated correctly

### Too Many Alerts

- Consider increasing threshold values
- Review whether deals are being moved through stages regularly
- Implement automatic cleanup of truly dead deals

## Contributing

When contributing to this feature:

1. Add tests for any new functionality
2. Update documentation for API changes
3. Follow the existing code style
4. Run `npm test` before submitting changes

## License

MIT
