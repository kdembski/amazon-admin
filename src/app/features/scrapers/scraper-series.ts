import { toBuckets } from '@app/shared/charts/buckets';
import { chartPoints } from '@app/shared/charts/to-chart-points';
import { sumBy } from '@app/shared/math/sum';
import { ScraperSeries, ScraperSeriesPoint } from '@app/types/api-dtos';
import { ChartSeries } from '@app/types/chart';
import { ScraperChartField } from '@app/types/scrapers';
import { Granularity, TimeRange } from '@app/types/time-range';

const emptyPoint = (t: string): ScraperSeriesPoint => ({
  t,
  itemsPerSecond: 0,
  wastedPercent: 0,
  captchaPercent: 0,
  requests: 0,
});

export const combineScraperPoints = (
  dayStart: Date,
  points: ScraperSeriesPoint[],
): ScraperSeriesPoint => {
  const requests = sumBy(points, (point) => point.requests);
  const weighted = (field: 'wastedPercent' | 'captchaPercent') => {
    return requests > 0 ? sumBy(points, (point) => point[field] * point.requests) / requests : 0;
  };

  return {
    t: dayStart.toISOString(),
    itemsPerSecond: sumBy(points, (point) => point.itemsPerSecond) / points.length,
    wastedPercent: weighted('wastedPercent'),
    captchaPercent: weighted('captchaPercent'),
    requests,
  };
};

export const toScraperSeries = (
  series: ScraperSeries[],
  range: TimeRange,
  unit: Granularity,
  field: ScraperChartField,
): ChartSeries[] => {
  return series.map(({ scraper, points }) => {
    const buckets = toBuckets(points, range, unit, emptyPoint, combineScraperPoints);

    return { label: scraper, points: chartPoints(buckets, (point) => point[field]) };
  });
};
