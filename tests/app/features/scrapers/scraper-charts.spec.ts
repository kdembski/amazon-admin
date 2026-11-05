import {
  toScraperSeries,
  toScraperStatuses,
  toScraperTiles,
} from '@app/features/scrapers/scraper-charts';
import { ScraperMetricSummary, ScraperSeries } from '@app/types/api-dtos';

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

describe('toScraperTiles', () => {
  const summary = (scraper: string, requests: number, previousRequests: number) =>
    ({
      scraper,
      requests,
      previousRequests,
      itemsPerSecond: requests / 100,
      itemsPerSecondDiff: (requests - previousRequests) / 100,
      proxyBytes: requests * 1_048_576,
      previousProxyBytes: previousRequests * 1_048_576,
      directBytes: requests * 524_288,
      previousDirectBytes: previousRequests * 1_048_576,
    }) as ScraperMetricSummary;
  const tiles = toScraperTiles([summary('amazon-pdp', 300, 200), summary('amazon-plp', 100, 0)], {
    from: new Date('2026-11-05T10:00:00Z'),
    to: new Date('2026-11-05T10:01:40Z'),
  });

  it('sums the requests of all scrapers without a breakdown', () => {
    expect(tiles[0]).toEqual({ label: 'Requests', value: 400, change: 100, details: [] });
  });

  it('divides the requests of each scraper by the seconds of the range', () => {
    expect(tiles[2]).toEqual({
      label: 'Requests/s',
      value: 4,
      change: 100,
      digits: 1,
      details: [
        { label: 'amazon-pdp', value: 3, change: 50 },
        { label: 'amazon-plp', value: 1, change: null },
      ],
    });
  });

  it('sums items/s with the change derived from the diff', () => {
    expect(tiles[1]).toEqual({
      label: 'Items/s',
      value: 4,
      change: 100,
      digits: 2,
      details: [
        { label: 'amazon-pdp', value: 3, change: 50 },
        { label: 'amazon-plp', value: 1, change: null },
      ],
    });
  });

  it('sums the transfer of all scrapers in megabytes, split into proxy and direct', () => {
    expect(tiles[3]).toEqual({
      label: 'Transfer in + out (MB)',
      value: 600,
      change: 50,
      digits: 1,
      details: [
        { label: 'Proxy', value: 400, change: 100 },
        { label: 'Direct', value: 200, change: 0 },
      ],
    });
  });
});

describe('toScraperStatuses', () => {
  const now = new Date('2026-10-26T12:00:00.000Z');

  it('marks a scraper silent for more than 5 minutes as stopped', () => {
    expect(
      toScraperStatuses(
        [
          { scraper: 'amazon-pdp', lastReportAt: '2026-10-26T11:58:30.000Z' },
          { scraper: 'amazon-plp', lastReportAt: '2026-10-26T11:40:00.000Z' },
        ],
        now,
      ),
    ).toEqual([
      {
        scraper: 'amazon-pdp',
        lastReportAt: new Date('2026-10-26T11:58:30.000Z'),
        minutesAgo: 1,
        stopped: false,
      },
      {
        scraper: 'amazon-plp',
        lastReportAt: new Date('2026-10-26T11:40:00.000Z'),
        minutesAgo: 20,
        stopped: true,
      },
    ]);
  });

  it('shows 0 minutes for a report stamped after the load', () => {
    const [status] = toScraperStatuses(
      [{ scraper: 'amazon-pdp', lastReportAt: '2026-10-26T12:00:05.000Z' }],
      now,
    );

    expect(status).toMatchObject({ minutesAgo: 0, stopped: false });
  });
});
