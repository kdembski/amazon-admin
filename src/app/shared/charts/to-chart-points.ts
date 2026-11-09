import { TimePoint } from '@app/types/api-dtos';
import { ChartPoint } from '@app/types/chart';
import { Granularity, TimeRange } from '@app/types/time-range';
import { sumPoints, toBuckets } from './buckets';

export const chartPoints = <T extends { t: string }>(
  buckets: T[],
  value: (point: T) => number,
): ChartPoint[] => {
  return buckets.map((point) => ({ t: new Date(point.t), value: value(point) }));
};

export const toChartPoints = (
  points: TimePoint[],
  range: TimeRange,
  unit: Granularity,
): ChartPoint[] => {
  const buckets = toBuckets(points, range, unit, (t) => ({ t, value: 0 }), sumPoints);

  return chartPoints(buckets, (point) => point.value);
};
