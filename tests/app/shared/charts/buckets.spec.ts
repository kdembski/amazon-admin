import {
  combineScraperPoints,
  fillHours,
  sumPoints,
  toDailyBuckets,
} from '@app/shared/charts/buckets';
import { ScraperSeriesPoint, TimePoint } from '@app/types/api-dtos';

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

describe('combineScraperPoints', () => {
  const day = new Date(2026, 9, 26);
  const scraper = (
    itemsPerSecond: number,
    percent: number,
    requests: number,
  ): ScraperSeriesPoint => ({
    t: day.toISOString(),
    itemsPerSecond,
    wastedPercent: percent,
    captchaPercent: percent / 2,
    requests,
  });

  it('averages items/s, weights the percents by requests and sums requests', () => {
    expect(combineScraperPoints(day, [scraper(1, 10, 100), scraper(3, 40, 300)])).toEqual({
      t: day.toISOString(),
      itemsPerSecond: 2,
      wastedPercent: 32.5,
      captchaPercent: 16.25,
      requests: 400,
    });
  });

  it('gives 0 % without requests', () => {
    expect(combineScraperPoints(day, [scraper(0, 0, 0), scraper(0, 0, 0)])).toMatchObject({
      wastedPercent: 0,
      captchaPercent: 0,
      requests: 0,
    });
  });
});
