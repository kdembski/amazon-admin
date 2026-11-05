import { combineScraperPoints, fillHours, toDailyBuckets } from '@app/shared/charts/buckets';
import { stat } from '@app/shared/summary/summary';
import {
  ScraperMetricSummary,
  ScraperSeries,
  ScraperSeriesPoint,
  ScraperStatus,
} from '@app/types/api-dtos';
import { ChartSeries } from '@app/types/chart';
import { ScraperChartField, ScraperStatusRow } from '@app/types/scrapers';
import { SummaryTile } from '@app/types/summary';
import { Granularity, TimeRange } from '@app/types/time-range';

// Scrapers report every minute while they have work; a longer silence means a stop or a crash.
const STOPPED_AFTER_MS = 5 * 60_000;

const emptyPoint = (t: string): ScraperSeriesPoint => ({
  t,
  itemsPerSecond: 0,
  wastedPercent: 0,
  captchaPercent: 0,
  requests: 0,
});

export const toScraperSeries = (
  series: ScraperSeries[],
  range: TimeRange,
  unit: Granularity,
  field: ScraperChartField,
): ChartSeries[] => {
  return series.map(({ scraper, points }) => {
    const hours = fillHours(points, range, emptyPoint);
    const buckets = unit === 'day' ? toDailyBuckets(hours, combineScraperPoints) : hours;

    return {
      label: scraper,
      points: buckets.map((point) => ({ t: new Date(point.t), value: point[field] })),
    };
  });
};

const megabytes = (bytes: number) => bytes / 1_048_576;

export const toScraperTiles = (
  summaries: ScraperMetricSummary[],
  range: TimeRange,
): SummaryTile[] => {
  const seconds = (range.to.getTime() - range.from.getTime()) / 1000;
  const total = (field: (summary: ScraperMetricSummary) => number) => {
    return summaries.reduce((sum, summary) => sum + field(summary), 0);
  };
  const tile = (
    label: string,
    digits: number,
    value: (summary: ScraperMetricSummary) => number,
    previous: (summary: ScraperMetricSummary) => number,
  ): SummaryTile => {
    return {
      ...stat(label, total(value), total(previous)),
      digits,
      details: summaries.map((summary) => stat(summary.scraper, value(summary), previous(summary))),
    };
  };
  const proxy = megabytes(total((summary) => summary.proxyBytes));
  const previousProxy = megabytes(total((summary) => summary.previousProxyBytes));
  const direct = megabytes(total((summary) => summary.directBytes));
  const previousDirect = megabytes(total((summary) => summary.previousDirectBytes));

  return [
    {
      ...stat(
        'Requests',
        total((summary) => summary.requests),
        total((summary) => summary.previousRequests),
      ),
      details: [],
    },
    tile(
      'Items/s',
      2,
      (summary) => summary.itemsPerSecond,
      (summary) => summary.itemsPerSecond - summary.itemsPerSecondDiff,
    ),
    tile(
      'Requests/s',
      1,
      (summary) => summary.requests / seconds,
      (summary) => summary.previousRequests / seconds,
    ),
    {
      ...stat('Transfer in + out (MB)', proxy + direct, previousProxy + previousDirect),
      digits: 1,
      details: [stat('Proxy', proxy, previousProxy), stat('Direct', direct, previousDirect)],
    },
  ];
};

export const toScraperStatuses = (statuses: ScraperStatus[], now: Date): ScraperStatusRow[] => {
  return statuses.map(({ scraper, lastReportAt }) => {
    const age = now.getTime() - Date.parse(lastReportAt);

    return {
      scraper,
      lastReportAt: new Date(lastReportAt),
      minutesAgo: Math.max(0, Math.floor(age / 60_000)),
      stopped: age > STOPPED_AFTER_MS,
    };
  });
};
