// Copies of amazon-server DTOs (src/modules/monitoring/dtos); keep field names in sync.

export type ActivityEventType = 'ad_scraped' | 'country_outlier_sent' | 'price_drop_sent';
export type LogLevel = 'error' | 'warn';

export interface TimePoint {
  t: string;
  value: number;
}

export interface ActivitySeries {
  type: ActivityEventType;
  channel: string | null;
  points: TimePoint[];
}

export interface ActivityStatsDto {
  series: ActivitySeries[];
  totals: Record<ActivityEventType, number>;
  previousTotals: Record<ActivityEventType, number>;
}

export interface LogLevelCounts {
  error: number;
  warn: number;
}

export interface LogStatsDto {
  series: { level: LogLevel; points: TimePoint[] }[];
  totals: LogLevelCounts;
  previousTotals: LogLevelCounts;
  topSources: ({ source: string } & LogLevelCounts)[];
}

export interface ScraperMetricSummary {
  scraper: string;
  itemsPerSecond: number;
  itemsPerSecondDiff: number;
  requests: number;
  wastedPercent: number;
  captchaPercent: number;
  kbPerItem: number | null;
  reusePercent: number;
  attemptsPerItem: number | null;
}

export interface ScraperSeriesPoint {
  t: string;
  itemsPerSecond: number;
  wastedPercent: number;
  captchaPercent: number;
  requests: number;
}

export interface ScraperSeries {
  scraper: string;
  points: ScraperSeriesPoint[];
}
