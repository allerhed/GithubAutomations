/**
 * Dashboard Service for CRM Metrics and Analytics
 */

import {
  Deal,
  PipelineStage,
  DashboardData,
  PipelineMetrics,
  StageMetrics,
  ForecastData
} from './models';

export class DashboardService {
  /**
   * Generate dashboard data with pipeline metrics, stage breakdown, and forecasts
   */
  generateDashboard(deals: Deal[]): DashboardData {
    const activeDeals = deals.filter(
      d => d.stage !== PipelineStage.CLOSED_WON && d.stage !== PipelineStage.CLOSED_LOST
    );

    return {
      summary: this.calculatePipelineMetrics(activeDeals),
      stageBreakdown: this.calculateStageMetrics(activeDeals),
      forecast: this.calculateForecast(activeDeals),
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate overall pipeline metrics
   */
  private calculatePipelineMetrics(deals: Deal[]): PipelineMetrics {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const dealCount = deals.length;
    const averageDealValue = dealCount > 0 ? totalValue / dealCount : 0;
    const weightedValue = deals.reduce(
      (sum, deal) => sum + (deal.value * deal.probability / 100),
      0
    );

    return {
      totalValue,
      dealCount,
      averageDealValue,
      weightedValue
    };
  }

  /**
   * Calculate metrics broken down by pipeline stage
   */
  private calculateStageMetrics(deals: Deal[]): StageMetrics[] {
    const stages = Object.values(PipelineStage).filter(
      stage => stage !== PipelineStage.CLOSED_WON && stage !== PipelineStage.CLOSED_LOST
    );

    const stageMetrics = stages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
      const dealCount = stageDeals.length;
      const averageDealValue = dealCount > 0 ? totalValue / dealCount : 0;

      return {
        stage,
        dealCount,
        totalValue,
        averageDealValue
      };
    });

    // Calculate conversion rates
    return this.addConversionRates(stageMetrics, deals);
  }

  /**
   * Add conversion rates to stage metrics
   */
  private addConversionRates(stageMetrics: StageMetrics[], allDeals: Deal[]): StageMetrics[] {
    const stageOrder = [
      PipelineStage.LEAD,
      PipelineStage.QUALIFIED,
      PipelineStage.PROPOSAL,
      PipelineStage.NEGOTIATION
    ];

    return stageMetrics.map((metrics, index) => {
      if (index < stageOrder.length - 1) {
        const currentStage = stageOrder[index];
        const nextStage = stageOrder[index + 1];
        
        const currentCount = allDeals.filter(d => d.stage === currentStage).length;
        const nextCount = allDeals.filter(d => d.stage === nextStage).length;
        const wonCount = allDeals.filter(d => d.stage === PipelineStage.CLOSED_WON).length;
        
        // Conversion rate is deals that progressed / total deals at this stage
        const totalProgressed = nextCount + wonCount;
        const conversionRate = currentCount > 0 
          ? (totalProgressed / (currentCount + totalProgressed)) * 100 
          : 0;

        return { ...metrics, conversionRate };
      }
      return metrics;
    });
  }

  /**
   * Calculate forecast based on weighted deals and expected close dates
   */
  private calculateForecast(deals: Deal[]): ForecastData[] {
    const now = new Date();
    const forecasts: Map<string, Deal[]> = new Map();

    // Group deals by month/quarter
    deals.forEach(deal => {
      const closeDate = new Date(deal.expectedCloseDate);
      const period = `${closeDate.getFullYear()}-Q${Math.floor(closeDate.getMonth() / 3) + 1}`;
      
      if (closeDate >= now) {
        if (!forecasts.has(period)) {
          forecasts.set(period, []);
        }
        forecasts.get(period)!.push(deal);
      }
    });

    // Calculate forecast metrics for each period
    const forecastData: ForecastData[] = [];
    forecasts.forEach((periodDeals, period) => {
      const weightedValue = periodDeals.reduce(
        (sum, deal) => sum + (deal.value * deal.probability / 100),
        0
      );
      const dealCount = periodDeals.length;
      const averageProbability = dealCount > 0
        ? periodDeals.reduce((sum, deal) => sum + deal.probability, 0) / dealCount
        : 0;
      const expectedRevenue = weightedValue;

      forecastData.push({
        period,
        weightedValue,
        dealCount,
        averageProbability,
        expectedRevenue
      });
    });

    // Sort by period
    return forecastData.sort((a, b) => a.period.localeCompare(b.period));
  }

  /**
   * Get visual indicators for pipeline health
   */
  getVisualIndicators(dashboardData: DashboardData): {
    pipelineHealth: string;
    conversionTrend: string;
    forecastConfidence: string;
  } {
    const { summary, stageBreakdown, forecast } = dashboardData;

    // Pipeline health based on weighted value vs total value
    const healthRatio = summary.totalValue > 0 
      ? summary.weightedValue / summary.totalValue 
      : 0;
    const pipelineHealth = 
      healthRatio > 0.6 ? '🟢 Healthy' :
      healthRatio > 0.4 ? '🟡 Moderate' :
      '🔴 At Risk';

    // Conversion trend based on average conversion rates
    const avgConversionRate = stageBreakdown
      .filter(s => s.conversionRate !== undefined)
      .reduce((sum, s) => sum + (s.conversionRate || 0), 0) / 
      stageBreakdown.filter(s => s.conversionRate !== undefined).length;
    const conversionTrend = 
      avgConversionRate > 50 ? '📈 Strong' :
      avgConversionRate > 30 ? '➡️ Steady' :
      '📉 Weak';

    // Forecast confidence based on average probability
    const avgForecastProbability = forecast.length > 0
      ? forecast.reduce((sum, f) => sum + f.averageProbability, 0) / forecast.length
      : 0;
    const forecastConfidence = 
      avgForecastProbability > 60 ? '✅ High' :
      avgForecastProbability > 40 ? '⚠️ Medium' :
      '❌ Low';

    return {
      pipelineHealth,
      conversionTrend,
      forecastConfidence
    };
  }
}
