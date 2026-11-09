import { combineScraperPoints, toScraperSeries } from '@app/features/scrapers/scraper-series';
import { ScraperSeries, ScraperSeriesPoint } from '@app/types/api-dtos';

const range = {
  from: new Date('2026-10-26T10:00:00.000Z'),
  to: new Date('2026-10-26T13:00:00.000Z'),
};
const at = (hour: number) => `2026-10-26T${hour}:00:00.000Z`;

const series: ScraperSeries[] = [
  {
    scraper: 'amazon-pdp-1',
    points: [
      { t: at(10), itemsPerSecond: 2, wastedPercent: 10, captchaPercent: 1, requests: 100 },
      { t: at(12), itemsPerSecond: 4, wastedPercent: 40, captchaPercent: 4, requests: 300 },
    ],
  },
  { scraper: 'amazon-plp', points: [] },
];

describe('toScraperSeries', () => {
  it('returns one series per scraper with every hour of the range', () => {
    const result = toScraperSeries(series, range, 'hour', 'itemsPerSecond');

    expect(result.map((s) => s.label)).toEqual(['amazon-pdp-1', 'amazon-plp']);
    expect(result[0].points).toEqual([
      { t: new Date(at(10)), value: 2 },
      { t: new Date(at(11)), value: 0 },
      { t: new Date(at(12)), value: 4 },
    ]);
  });

  it('averages items/s over the hours of a day, missing hours counting as 0', () => {
    const [pdp] = toScraperSeries(series, range, 'day', 'itemsPerSecond');

    expect(pdp.points).toEqual([{ t: new Date(2026, 9, 26), value: 2 }]);
  });

  it('weights the daily percents by requests', () => {
    const [pdp] = toScraperSeries(series, range, 'day', 'wastedPercent');

    expect(pdp.points[0].value).toBe(32.5);
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
