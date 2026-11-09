import {
  attemptsPerItem,
  directMegabytes,
  proxyMegabytes,
  requestPercent,
} from '@app/features/scrapers/scraper-count-metrics';
import { toCountSeries } from '@app/features/scrapers/scraper-count-series';
import { ScraperCountPoint, ScraperCountSeries } from '@app/types/api-dtos';

const range = {
  from: new Date('2026-10-26T10:00:00.000Z'),
  to: new Date('2026-10-26T13:00:00.000Z'),
};
const at = (hour: number) => `2026-10-26T${hour}:00:00.000Z`;

describe('toCountSeries', () => {
  const point = (t: string, requests: number, wasted: number): ScraperCountPoint => ({
    t,
    requests,
    wasted,
    captcha: 0,
    http503: 0,
    items: requests / 2,
    itemAttempts: requests,
    proxyBytes: requests * 1_048_576,
    directBytes: 0,
  });
  const countries: ScraperCountSeries[] = [
    { group: 'de', points: [point(at(10), 100, 10), point(at(12), 300, 120)] },
    { group: 'pl', points: [] },
  ];
  const wasted = { '': requestPercent((p) => p.wasted) };

  it('returns one series per country with every hour of the range', () => {
    const result = toCountSeries(countries, range, 'hour', wasted);

    expect(result.map((s) => s.label)).toEqual(['de', 'pl']);
    expect(result[0].points).toEqual([
      { t: new Date(at(10)), value: 10 },
      { t: new Date(at(11)), value: 0 },
      { t: new Date(at(12)), value: 40 },
    ]);
  });

  it('sums the counts of a day before dividing them', () => {
    const [de] = toCountSeries(countries, range, 'day', wasted);

    expect(de.points).toEqual([{ t: new Date(2026, 9, 26), value: 32.5 }]);
  });

  it('labels every named line with the country and its name', () => {
    const result = toCountSeries(countries, range, 'day', {
      proxy: proxyMegabytes,
      direct: directMegabytes,
    });

    expect(result.map((s) => [s.label, s.points[0].value])).toEqual([
      ['de proxy', 400],
      ['de direct', 0],
      ['pl proxy', 0],
      ['pl direct', 0],
    ]);
  });

  it('shows 0 attempts/item for an hour without items', () => {
    const [de] = toCountSeries(countries, range, 'hour', { '': attemptsPerItem });

    expect(de.points.map((p) => p.value)).toEqual([2, 0, 2]);
  });
});
