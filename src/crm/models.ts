/**
 * CRM Data Models for Deals, Pipeline Stages, and Metrics
 */

export enum PipelineStage {
  LEAD = 'Lead',
  QUALIFIED = 'Qualified',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost'
}

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: PipelineStage;
  probability: number; // 0-100, represents likelihood of closing
  expectedCloseDate: Date;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
}

export interface PipelineMetrics {
  totalValue: number;
  dealCount: number;
  averageDealValue: number;
  weightedValue: number;
}

export interface StageMetrics {
  stage: PipelineStage;
  dealCount: number;
  totalValue: number;
  averageDealValue: number;
  conversionRate?: number; // percentage of deals that moved to next stage
}

export interface ForecastData {
  period: string;
  weightedValue: number;
  dealCount: number;
  averageProbability: number;
  expectedRevenue: number;
}

export interface DashboardData {
  summary: PipelineMetrics;
  stageBreakdown: StageMetrics[];
  forecast: ForecastData[];
  lastUpdated: Date;
}
