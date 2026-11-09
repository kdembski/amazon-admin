import { fillHours, sumPoints, toBuckets, toDailyBuckets } from '@app/shared/charts/buckets';
import { TimePoint } from '@app/types/api-dtos';

const zero = (t: string): TimePoint => ({ t, value: 0 });
const point = (t: Date, value: number): TimePoint => ({ t: t.toISOString(), value });

describe('time zone of the tests', () => {
  it('is Europe/Warsaw', () => {
    expect(new Date(2026, 9, 24).getTimezoneOffset()).toBe(-120);
    expect(new Date(2026, 9, 26).getTimezoneOffset()).toBe(-60);
  });
});

describe('fillHours', () => {
  it('returns one point per UTC hour of the range and fills the missing ones', () => {
    const range = {
      from: new Date('2026-10-26T10:30:00.000Z'),
      to: new Date('2026-10-26T13:00:00.000Z'),
    };

    expect(fillHours([{ t: '2026-10-26T11:00:00.000Z', value: 5 }], range, zero)).toEqual([
      { t: '2026-10-26T10:00:00.000Z', value: 0 },
      { t: '2026-10-26T11:00:00.000Z', value: 5 },
      { t: '2026-10-26T12:00:00.000Z', value: 0 },
    ]);
  });

  it('includes the hour of a range end that is not on the hour', () => {
    const range = {
      from: new Date('2026-10-26T10:00:00.000Z'),
      to: new Date('2026-10-26T11:15:00.000Z'),
    };

    expect(fillHours([], range, zero).map((p) => p.t)).toEqual([
      '2026-10-26T10:00:00.000Z',
      '2026-10-26T11:00:00.000Z',
    ]);
  });
});

describe('toDailyBuckets', () => {
  it('splits points at local midnight', () => {
    const points = [point(new Date(2026, 9, 25, 23), 2), point(new Date(2026, 9, 26, 0), 3)];

    expect(toDailyBuckets(points, sumPoints)).toEqual([
      { t: new Date(2026, 9, 25).toISOString(), value: 2 },
      { t: new Date(2026, 9, 26).toISOString(), value: 3 },
    ]);
  });

  it('groups the 25 hours of a DST day into one bucket', () => {
    const range = { from: new Date(2026, 9, 25), to: new Date(2026, 9, 26) };
    const hours = fillHours([], range, (t) => ({ t, value: 1 }));

    expect(hours).toHaveLength(25);
    expect(toDailyBuckets(hours, sumPoints)).toEqual([
      { t: new Date(2026, 9, 25).toISOString(), value: 25 },
    ]);
  });
});

describe('toBuckets', () => {
  const range = { from: new Date(2026, 9, 26, 10), to: new Date(2026, 9, 26, 12) };
  const points = [point(new Date(2026, 9, 26, 11), 4)];

  it('keeps the filled hours for the hour unit', () => {
    expect(toBuckets(points, range, 'hour', zero, sumPoints).map((p) => p.value)).toEqual([0, 4]);
  });

  it('combines the filled hours into days for the day unit', () => {
    expect(toBuckets(points, range, 'day', zero, sumPoints)).toEqual([
      { t: new Date(2026, 9, 26).toISOString(), value: 4 },
    ]);
  });
});
