import { startOfDay } from 'date-fns';
import { sumFields } from '@app/shared/math/sum';
import { floorToHour, HOUR } from '@app/shared/time-range/time-range';
import { TimePoint } from '@app/types/api-dtos';
import { Granularity, TimeRange } from '@app/types/time-range';

export const fillHours = <T extends { t: string }>(
  points: T[],
  range: TimeRange,
  empty: (t: string) => T,
): T[] => {
  const byHour = new Map(points.map((point) => [Date.parse(point.t), point]));
  const filled: T[] = [];

  for (let hour = floorToHour(range.from).getTime(); hour < range.to.getTime(); hour += HOUR) {
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
    const dayPoints = days.get(day) ?? [];

    dayPoints.push(point);
    days.set(day, dayPoints);
  });

  return [...days].map(([day, dayPoints]) => combine(new Date(day), dayPoints));
};

export const toBuckets = <T extends { t: string }>(
  points: T[],
  range: TimeRange,
  unit: Granularity,
  empty: (t: string) => T,
  combine: (dayStart: Date, points: T[]) => T,
): T[] => {
  const hours = fillHours(points, range, empty);

  return unit === 'day' ? toDailyBuckets(hours, combine) : hours;
};

export const sumPoints = (dayStart: Date, points: TimePoint[]): TimePoint => ({
  t: dayStart.toISOString(),
  ...sumFields(points, ['value']),
});
