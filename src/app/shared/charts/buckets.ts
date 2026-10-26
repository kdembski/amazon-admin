import { startOfDay } from 'date-fns';
import { ScraperSeriesPoint, TimePoint } from '@app/types/api-dtos';
import { TimeRange } from '@app/types/time-range';

const HOUR = 3_600_000;

export const fillHours = <T extends { t: string }>(
  points: T[],
  range: TimeRange,
  empty: (t: string) => T,
): T[] => {
  const byHour = new Map(points.map((point) => [Date.parse(point.t), point]));
  const filled: T[] = [];

  for (
    let hour = Math.floor(range.from.getTime() / HOUR) * HOUR;
    hour < range.to.getTime();
    hour += HOUR
  ) {
    filled.push(byHour.get(hour) ?? empty(new Date(hour).toISOString()));
  }

  return filled;
};

export const toDailyBuckets = <T extends { t: string }>(
  points: T[],
  combine: (dayStart: Date, points: T[]) => T,
): T[] => {
  const days = new Map<number, T[]>();

  points.forEach((point) => {
    const day = startOfDay(new Date(point.t)).getTime();
    days.set(day, [...(days.get(day) ?? []), point]);
  });

  return [...days].map(([day, dayPoints]) => combine(new Date(day), dayPoints));
};

export const sumPoints = (dayStart: Date, points: TimePoint[]): TimePoint => ({
  t: dayStart.toISOString(),
  value: points.reduce((sum, point) => sum + point.value, 0),
});

export const combineScraperPoints = (
  dayStart: Date,
  points: ScraperSeriesPoint[],
): ScraperSeriesPoint => {
  const requests = points.reduce((sum, point) => sum + point.requests, 0);
  const weighted = (field: 'wastedPercent' | 'captchaPercent') => {
    return requests > 0
      ? points.reduce((sum, point) => sum + point[field] * point.requests, 0) / requests
      : 0;
  };

  return {
    t: dayStart.toISOString(),
    itemsPerSecond: points.reduce((sum, point) => sum + point.itemsPerSecond, 0) / points.length,
    wastedPercent: weighted('wastedPercent'),
    captchaPercent: weighted('captchaPercent'),
    requests,
  };
};
