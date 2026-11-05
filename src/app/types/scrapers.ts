import { ScraperSeriesPoint } from './api-dtos';

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
