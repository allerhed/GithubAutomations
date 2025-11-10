/**
 * Deal Alerts Module
 * 
 * This module provides functionality to detect and alert on stalled deals
 * in the sales pipeline based on configurable thresholds.
 */

export {
  Deal,
  DealStage,
  DealAlert,
  DealAlertConfig,
} from './types';

export {
  detectStalledDeals,
  calculateDaysInStage,
  getThresholdForStage,
  filterDeals,
  DEFAULT_ALERT_CONFIG,
} from './dealAlerts';
