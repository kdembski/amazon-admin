import { combineScraperPoints, fillHours, toDailyBuckets } from '@app/shared/charts/buckets';
import { stat } from '@app/shared/summary/summary';
import {
  ScraperCountPoint,
  ScraperCountSeries,
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

const emptyCountPoint = (t: string): ScraperCountPoint => ({
  t,
  requests: 0,
  wasted: 0,
  captcha: 0,
  http503: 0,
  items: 0,
  itemAttempts: 0,
  proxyBytes: 0,
  directBytes: 0,
});

const sumCountPoints = (dayStart: Date, points: ScraperCountPoint[]): ScraperCountPoint => {
  return points.reduce(
    (sum, point) => ({
      t: sum.t,
      requests: sum.requests + point.requests,
      wasted: sum.wasted + point.wasted,
      captcha: sum.captcha + point.captcha,
      http503: sum.http503 + point.http503,
      items: sum.items + point.items,
      itemAttempts: sum.itemAttempts + point.itemAttempts,
      proxyBytes: sum.proxyBytes + point.proxyBytes,
      directBytes: sum.directBytes + point.directBytes,
    }),
    emptyCountPoint(dayStart.toISOString()),
  );
};

export const requestPercent = (count: (point: ScraperCountPoint) => number) => {
  return (point: ScraperCountPoint) => {
    return point.requests > 0 ? (count(point) / point.requests) * 100 : 0;
  };
};

export const attemptsPerItem = (point: ScraperCountPoint) => {
  return point.items > 0 ? point.itemAttempts / point.items : 0;
};

export const proxyMegabytes = (point: ScraperCountPoint) => megabytes(point.proxyBytes);

export const directMegabytes = (point: ScraperCountPoint) => megabytes(point.directBytes);

// One line per group (scraper or country) and entry of lines; an entry named '' labels its line
// with the group alone.
export const toCountSeries = (
  series: ScraperCountSeries[],
  range: TimeRange,
  unit: Granularity,
  lines: Record<string, (point: ScraperCountPoint) => number>,
): ChartSeries[] => {
  return series.flatMap(({ group, points }) => {
    const hours = fillHours(points, range, emptyCountPoint);
    const buckets = unit === 'day' ? toDailyBuckets(hours, sumCountPoints) : hours;

    return Object.entries(lines).map(([name, value]) => ({
      label: name ? `${group} ${name}` : group,
      points: buckets.map((point) => ({ t: new Date(point.t), value: value(point) })),
    }));
  });
};

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
      column: 0,
      details: [],
    };
  };
  const proxy = megabytes(total((summary) => summary.proxyBytes));
  const previousProxy = megabytes(total((summary) => summary.previousProxyBytes));
  const direct = megabytes(total((summary) => summary.directBytes));
  const previousDirect = megabytes(total((summary) => summary.previousDirectBytes));

  return [
    tile(
      'Requests',
      0,
      (summary) => summary.requests,
      (summary) => summary.previousRequests,
    ),
    tile(
      'Requests/s',
      1,
      (summary) => summary.requests / seconds,
      (summary) => summary.previousRequests / seconds,
    ),
    tile(
      'Items/s',
      2,
      (summary) => summary.itemsPerSecond,
      (summary) => summary.itemsPerSecond - summary.itemsPerSecondDiff,
    ),
    {
      ...stat('Transfer in + out (MB)', proxy + direct, previousProxy + previousDirect),
      digits: 1,
      column: 1,
      details: [stat('Proxy', proxy, previousProxy), stat('Direct', direct, previousDirect)],
    },
  ];
};

export const toScraperStatuses = (statuses: ScraperStatus[], now: Date): ScraperStatusRow[] => {
  return statuses.map((status) => {
    const age = now.getTime() - Date.parse(status.lastReportAt);

    return {
      ...status,
      lastReportAt: new Date(status.lastReportAt),
      minutesAgo: Math.max(0, Math.floor(age / 60_000)),
      stopped: age > STOPPED_AFTER_MS,
    };
  });
};
