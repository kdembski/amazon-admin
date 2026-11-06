import { ScraperSeriesPoint, ScraperStatus } from './api-dtos';

export type ScraperChartField = keyof Omit<ScraperSeriesPoint, 't' | 'requests'>;

export interface ScraperStatusRow extends Omit<ScraperStatus, 'lastReportAt'> {
  lastReportAt: Date;
  minutesAgo: number;
  stopped: boolean;
}
