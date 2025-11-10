/**
 * Represents a stage in the sales pipeline
 */
export interface DealStage {
  id: string;
  name: string;
  order: number;
}

/**
 * Represents a deal/opportunity in the CRM
 */
export interface Deal {
  id: string;
  title: string;
  value: number;
  expectedCloseDate: Date;
  owner: string;
  stage: string; // stage ID
  stageEnteredAt: Date;
  associatedContact?: string;
  associatedCompany?: string;
}

/**
 * Configuration for deal staleness alerts
 */
export interface DealAlertConfig {
  /**
   * Default threshold in days for considering a deal stalled
   */
  defaultThresholdDays: number;
  
  /**
   * Stage-specific thresholds (in days)
   * Maps stage ID to number of days
   */
  stageThresholds?: Record<string, number>;
}

/**
 * Represents an alert for a stalled deal
 */
export interface DealAlert {
  deal: Deal;
  daysInStage: number;
  threshold: number;
  message: string;
  severity: 'warning' | 'critical';
}
