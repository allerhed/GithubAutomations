/**
 * Export Service for CRM Reports
 * Supports CSV and Excel-compatible formats
 */

import { Deal, DashboardData, StageMetrics, ForecastData } from './models';

export class ExportService {
  /**
   * Export deals to CSV format
   */
  exportDealsToCSV(deals: Deal[]): string {
    const headers = [
      'ID',
      'Name',
      'Value',
      'Stage',
      'Probability (%)',
      'Expected Close Date',
      'Created At',
      'Updated At',
      'Owner'
    ];

    const rows = deals.map(deal => [
      deal.id,
      this.escapeCSV(deal.name),
      deal.value.toFixed(2),
      deal.stage,
      deal.probability,
      deal.expectedCloseDate.toISOString().split('T')[0],
      deal.createdAt.toISOString().split('T')[0],
      deal.updatedAt.toISOString().split('T')[0],
      this.escapeCSV(deal.owner)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Export dashboard summary to CSV format
   */
  exportDashboardToCSV(dashboardData: DashboardData): string {
    const lines: string[] = [];

    // Summary section
    lines.push('PIPELINE SUMMARY');
    lines.push('Metric,Value');
    lines.push(`Total Pipeline Value,${dashboardData.summary.totalValue.toFixed(2)}`);
    lines.push(`Total Deal Count,${dashboardData.summary.dealCount}`);
    lines.push(`Average Deal Value,${dashboardData.summary.averageDealValue.toFixed(2)}`);
    lines.push(`Weighted Pipeline Value,${dashboardData.summary.weightedValue.toFixed(2)}`);
    lines.push('');

    // Stage breakdown
    lines.push('STAGE BREAKDOWN');
    lines.push('Stage,Deal Count,Total Value,Average Deal Value,Conversion Rate (%)');
    dashboardData.stageBreakdown.forEach(stage => {
      lines.push(
        `${stage.stage},${stage.dealCount},${stage.totalValue.toFixed(2)},${stage.averageDealValue.toFixed(2)},${stage.conversionRate?.toFixed(2) || 'N/A'}`
      );
    });
    lines.push('');

    // Forecast
    lines.push('FORECAST');
    lines.push('Period,Weighted Value,Deal Count,Average Probability (%),Expected Revenue');
    dashboardData.forecast.forEach(forecast => {
      lines.push(
        `${forecast.period},${forecast.weightedValue.toFixed(2)},${forecast.dealCount},${forecast.averageProbability.toFixed(2)},${forecast.expectedRevenue.toFixed(2)}`
      );
    });
    lines.push('');

    lines.push(`Last Updated,${dashboardData.lastUpdated.toISOString()}`);

    return lines.join('\n');
  }

  /**
   * Export stage metrics to CSV
   */
  exportStageMetricsToCSV(stageMetrics: StageMetrics[]): string {
    const headers = [
      'Stage',
      'Deal Count',
      'Total Value',
      'Average Deal Value',
      'Conversion Rate (%)'
    ];

    const rows = stageMetrics.map(metrics => [
      metrics.stage,
      metrics.dealCount.toString(),
      metrics.totalValue.toFixed(2),
      metrics.averageDealValue.toFixed(2),
      metrics.conversionRate?.toFixed(2) || 'N/A'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Export forecast data to CSV
   */
  exportForecastToCSV(forecast: ForecastData[]): string {
    const headers = [
      'Period',
      'Weighted Value',
      'Deal Count',
      'Average Probability (%)',
      'Expected Revenue'
    ];

    const rows = forecast.map(data => [
      data.period,
      data.weightedValue.toFixed(2),
      data.dealCount.toString(),
      data.averageProbability.toFixed(2),
      data.expectedRevenue.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Generate Excel-compatible CSV with proper formatting
   * This creates a CSV that opens well in Excel
   */
  exportToExcelCSV(dashboardData: DashboardData): string {
    // Use semicolon separator for better Excel compatibility in some regions
    const csv = this.exportDashboardToCSV(dashboardData);
    return csv; // CSV format is already Excel-compatible
  }

  /**
   * Escape special characters in CSV values
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Save export to file (Node.js environment)
   */
  async saveToFile(content: string, filename: string): Promise<void> {
    if (typeof window === 'undefined') {
      // Node.js environment
      const fs = await import('fs');
      const path = await import('path');
      
      const outputDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, content, 'utf-8');
    } else {
      // Browser environment - trigger download
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}
