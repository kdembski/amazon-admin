import { toScraperTiles } from '@app/features/scrapers/scraper-tiles';
import { ScraperMetricSummary } from '@app/types/api-dtos';

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
    expect(tiles[0]).toEqual({
      label: 'Requests',
      value: 400,
      change: 100,
      digits: 0,
      column: 0,
      details: [],
    });
  });

  it('divides the requests by the seconds of the range, without a breakdown', () => {
    expect(tiles[1]).toEqual({
      label: 'Requests/s',
      value: 4,
      change: 100,
      digits: 1,
      column: 0,
      details: [],
    });
  });

  it('sums items/s with the change derived from the diff, without a breakdown', () => {
    expect(tiles[2]).toEqual({
      label: 'Items/s',
      value: 4,
      change: 100,
      digits: 2,
      column: 0,
      details: [],
    });
  });

  it('sums the transfer of all scrapers in megabytes, split into proxy and direct', () => {
    expect(tiles[3]).toEqual({
      label: 'Transfer in + out (MB)',
      value: 600,
      change: 50,
      digits: 1,
      column: 1,
      details: [
        { label: 'Proxy', value: 400, change: 100, share: 67 },
        { label: 'Direct', value: 200, change: 0, share: 33 },
      ],
    });
  });

  it('shows a share of 0 without any transfer', () => {
    const [, , , transfer] = toScraperTiles([], {
      from: new Date('2026-11-05T10:00:00Z'),
      to: new Date('2026-11-05T10:01:40Z'),
    });

    expect(transfer.details.map((detail) => detail.share)).toEqual([0, 0]);
  });
});
