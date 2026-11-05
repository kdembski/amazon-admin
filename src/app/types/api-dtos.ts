// Copies of amazon-server DTOs (src/modules/monitoring/dtos); keep field names in sync.

export type ActivityEventType =
  'ad_scraped' | 'country_outlier_sent' | 'price_drop_sent' | 'ad_created' | 'ad_deleted';
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
  // ad_scraped events with prices from at least minPrices countries; without the countryOutlier.minPrices setting
  comparable?: { minPrices: number; total: number; previousTotal: number };
  // channels of the countryOutlier.ruleGroups setting; id matches the channel of a series
  countryOutlierChannels: { id: string; name: string }[];
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

export type ScraperBreakdownKey = 'country' | 'flow';

export interface ScraperMetrics {
  itemsPerSecond: number;
  requests: number;
  wastedPercent: number;
  captchaPercent: number;
  kbPerItem: number | null;
  reusePercent: number;
  attemptsPerItem: number | null;
  bytesIn: number;
  bytesOut: number;
  connections: number;
}

export interface ScraperMetricSummary extends ScraperMetrics {
  scraper: string;
  itemsPerSecondDiff: number;
  previousRequests: number;
}

// connections and bytes carry no country: per country they are 0 and kbPerItem and reusePercent mean nothing
export interface ScraperBreakdown extends ScraperMetrics {
  scraper: string;
  group: string;
}

export interface ScraperStatus {
  scraper: string;
  lastReportAt: string;
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
