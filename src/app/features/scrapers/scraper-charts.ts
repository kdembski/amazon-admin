import { combineScraperPoints, fillHours, toDailyBuckets } from '@app/shared/charts/buckets';
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
