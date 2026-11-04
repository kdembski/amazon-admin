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

export const toRequestTiles = (summaries: ScraperMetricSummary[]): SummaryTile[] => {
  const total = (field: 'requests' | 'previousRequests') => {
    return summaries.reduce((sum, summary) => sum + summary[field], 0);
  };

  return [
    {
      ...stat('Requests', total('requests'), total('previousRequests')),
      details: summaries.map((summary) =>
        stat(summary.scraper, summary.requests, summary.previousRequests),
      ),
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
