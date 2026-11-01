import { ScraperMetricSummary, ScraperSeries, ScraperSeriesPoint } from './api-dtos';
import { TimeRange } from './time-range';

export interface ScrapersData {
  summaries: ScraperMetricSummary[];
  series: ScraperSeries[];
  range: TimeRange;
}

export type ScraperChartField = keyof Omit<ScraperSeriesPoint, 't' | 'requests'>;
