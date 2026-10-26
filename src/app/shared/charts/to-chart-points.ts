import { TimePoint } from '@app/types/api-dtos';
import { ChartPoint } from '@app/types/chart';
import { Granularity, TimeRange } from '@app/types/time-range';
import { fillHours, sumPoints, toDailyBuckets } from './buckets';

export const toChartPoints = (
  points: TimePoint[],
  range: TimeRange,
  unit: Granularity,
): ChartPoint[] => {
  const hours = fillHours(points, range, (t) => ({ t, value: 0 }));
  const buckets = unit === 'day' ? toDailyBuckets(hours, sumPoints) : hours;

  return buckets.map((point) => ({ t: new Date(point.t), value: point.value }));
};
