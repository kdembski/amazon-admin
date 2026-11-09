import {
  attemptsPerItem,
  directMegabytes,
  megabytes,
  proxyMegabytes,
  requestPercent,
} from '@app/features/scrapers/scraper-count-metrics';
import { ScraperCountPoint } from '@app/types/api-dtos';

const point: ScraperCountPoint = {
  t: '2026-10-26T10:00:00.000Z',
  requests: 200,
  wasted: 50,
  captcha: 0,
  http503: 0,
  items: 40,
  itemAttempts: 60,
  proxyBytes: 2_097_152,
  directBytes: 524_288,
};

describe('megabytes', () => {
  it('divides by 1024²', () => {
    expect(megabytes(3_145_728)).toBe(3);
  });
});

describe('requestPercent', () => {
  it('gives the count as a percent of the requests', () => {
    expect(requestPercent((p) => p.wasted)(point)).toBe(25);
  });

  it('gives 0 without requests', () => {
    expect(requestPercent((p) => p.wasted)({ ...point, requests: 0 })).toBe(0);
  });
});

describe('attemptsPerItem', () => {
  it('divides the attempts by the items', () => {
    expect(attemptsPerItem(point)).toBe(1.5);
  });

  it('gives 0 without items', () => {
    expect(attemptsPerItem({ ...point, items: 0 })).toBe(0);
  });
});

describe('proxyMegabytes and directMegabytes', () => {
  it('turn the bytes of each kind into megabytes', () => {
    expect([proxyMegabytes(point), directMegabytes(point)]).toEqual([2, 0.5]);
  });
});
