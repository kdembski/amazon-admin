import {
  ScraperBreakdown,
  ScraperMetricSummary,
  ScraperSeries,
  ScraperSeriesPoint,
  ScraperStatus,
} from './api-dtos';
import { TimeRange } from './time-range';

export interface ScrapersData {
  summaries: ScraperMetricSummary[];
  series: ScraperSeries[];
  countries: ScraperBreakdown[];
  flows: ScraperBreakdown[];
  statuses: ScraperStatus[];
  range: TimeRange;
  // When the statuses were loaded; their age is measured against it.
  loadedAt: Date;
}

export type ScraperChartField = keyof Omit<ScraperSeriesPoint, 't' | 'requests'>;

export interface ScraperStatusRow {
  scraper: string;
  lastReportAt: Date;
  minutesAgo: number;
  stopped: boolean;
}

export type BreakdownColumn =
  | 'requests'
  | 'itemsPerSecond'
  | 'wastedPercent'
  | 'captchaPercent'
  | 'attemptsPerItem'
  | 'bytesIn'
  | 'bytesOut'
  | 'connections'
  | 'reusePercent';
