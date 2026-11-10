// Copies of amazon-server DTOs (src/modules/monitoring/dtos); keep field names in sync.

export type ActivityEventType =
  'ad_scraped' | 'country_outlier_sent' | 'price_drop_sent' | 'ad_created' | 'ad_deleted';

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
  comparable?: { minPrices: number; total: number; previousTotal: number; points: TimePoint[] };
  // channels of the countryOutlier.ruleGroups setting; id matches the channel of a series
  countryOutlierChannels: { id: string; name: string }[];
}

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
  // bytes_in + bytes_out through proxies and over direct connections
  proxyBytes: number;
  previousProxyBytes: number;
  directBytes: number;
  previousDirectBytes: number;
}

// Averages of the last hour: rates over the whole hour, gauges over its reports; rps and concurrency from ScraperConfig, scrapers without a row are left out
export interface ScraperStatus {
  scraper: string;
  lastReportAt: string;
  itemsPerSecond: number;
  requestsPerSecond: number;
  // 0 = no limit
  rps: number;
  pending: number;
  concurrency: number;
  openConnections: number;
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

export type ScraperCountKey = 'scraper' | 'country';

// Counts of one UTC hour; summed into days before dividing them
export interface ScraperCountPoint {
  t: string;
  requests: number;
  wasted: number;
  captcha: number;
  http503: number;
  items: number;
  itemAttempts: number;
  proxyBytes: number;
  directBytes: number;
}

export interface ScraperCountSeries {
  group: string;
  points: ScraperCountPoint[];
}

// The same counts per scraper (every country) and per country (every scraper)
export type ScraperCountSeriesByKey = Record<ScraperCountKey, ScraperCountSeries[]>;
