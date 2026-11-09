import { toBuckets } from '@app/shared/charts/buckets';
import { chartPoints } from '@app/shared/charts/to-chart-points';
import { sumFields } from '@app/shared/math/sum';
import { ScraperCountPoint, ScraperCountSeries } from '@app/types/api-dtos';
import { ChartSeries } from '@app/types/chart';
import { Granularity, TimeRange } from '@app/types/time-range';

const COUNT_FIELDS = [
  'requests',
  'wasted',
  'captcha',
  'http503',
  'items',
  'itemAttempts',
  'proxyBytes',
  'directBytes',
] as const;

const emptyCountPoint = (t: string): ScraperCountPoint => ({ t, ...sumFields([], COUNT_FIELDS) });

const sumCountPoints = (dayStart: Date, points: ScraperCountPoint[]): ScraperCountPoint => ({
  t: dayStart.toISOString(),
  ...sumFields(points, COUNT_FIELDS),
});

const lineLabel = (group: string, name: string) => (name ? `${group} ${name}` : group);

export const toCountSeries = (
  series: ScraperCountSeries[],
  range: TimeRange,
  unit: Granularity,
  lines: Record<string, (point: ScraperCountPoint) => number>,
): ChartSeries[] => {
  return series.flatMap(({ group, points }) => {
    const buckets = toBuckets(points, range, unit, emptyCountPoint, sumCountPoints);

    return Object.entries(lines).map(([name, value]) => ({
      label: lineLabel(group, name),
      points: chartPoints(buckets, value),
    }));
  });
};
