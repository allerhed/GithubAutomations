import { Deal, DealAlert, DealAlertConfig } from './types';

/**
 * Default configuration for deal alerts
 */
export const DEFAULT_ALERT_CONFIG: DealAlertConfig = {
  defaultThresholdDays: 30,
  stageThresholds: {
    'prospecting': 14,
    'qualification': 21,
    'proposal': 14,
    'negotiation': 7,
    'closing': 7,
  },
};

/**
 * Detects stalled deals based on configurable thresholds
 * 
 * @param deals - Array of deals to check
 * @param config - Alert configuration (optional, uses defaults if not provided)
 * @param currentDate - Current date for calculation (optional, uses Date.now() if not provided)
 * @returns Array of alerts for stalled deals
 */
export function detectStalledDeals(
  deals: Deal[],
  config: DealAlertConfig = DEFAULT_ALERT_CONFIG,
  currentDate: Date = new Date()
): DealAlert[] {
  const alerts: DealAlert[] = [];

  for (const deal of deals) {
    const daysInStage = calculateDaysInStage(deal.stageEnteredAt, currentDate);
    const threshold = getThresholdForStage(deal.stage, config);

    if (daysInStage >= threshold) {
      const alert = createAlert(deal, daysInStage, threshold);
      alerts.push(alert);
    }
  }

  return alerts;
}

/**
 * Calculate the number of days a deal has been in its current stage
 * 
 * @param stageEnteredAt - Date when the deal entered the current stage
 * @param currentDate - Current date for calculation
 * @returns Number of days in the current stage
 */
export function calculateDaysInStage(stageEnteredAt: Date, currentDate: Date): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const timeDiff = currentDate.getTime() - stageEnteredAt.getTime();
  return Math.floor(timeDiff / millisecondsPerDay);
}

/**
 * Get the threshold for a specific stage
 * 
 * @param stageId - Stage identifier
 * @param config - Alert configuration
 * @returns Threshold in days for the stage
 */
export function getThresholdForStage(stageId: string, config: DealAlertConfig): number {
  if (config.stageThresholds && stageId in config.stageThresholds) {
    return config.stageThresholds[stageId];
  }
  return config.defaultThresholdDays;
}

/**
 * Create an alert for a stalled deal
 * 
 * @param deal - The stalled deal
 * @param daysInStage - Number of days in current stage
 * @param threshold - Threshold that was exceeded
 * @returns DealAlert object
 */
function createAlert(deal: Deal, daysInStage: number, threshold: number): DealAlert {
  const daysOverThreshold = daysInStage - threshold;
  const severity = daysOverThreshold >= threshold ? 'critical' : 'warning';
  
  const message = `Deal "${deal.title}" has been in stage "${deal.stage}" for ${daysInStage} days ` +
    `(threshold: ${threshold} days). Consider taking action to move this deal forward.`;

  return {
    deal,
    daysInStage,
    threshold,
    message,
    severity,
  };
}

/**
 * Filter deals by specific criteria
 * 
 * @param deals - Array of deals
 * @param owner - Filter by owner (optional)
 * @param stage - Filter by stage (optional)
 * @returns Filtered array of deals
 */
export function filterDeals(
  deals: Deal[],
  owner?: string,
  stage?: string
): Deal[] {
  let filtered = deals;

  if (owner) {
    filtered = filtered.filter(deal => deal.owner === owner);
  }

  if (stage) {
    filtered = filtered.filter(deal => deal.stage === stage);
  }

  return filtered;
}
