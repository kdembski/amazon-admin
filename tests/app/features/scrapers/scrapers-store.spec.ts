import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import {
  AttemptsStore,
  CaptchaStore,
  Http503Store,
  ItemsStore,
  StatusStore,
  TransferStore,
  WastedStore,
} from '@app/features/scrapers/scrapers-store';
import {
  ScraperCountPoint,
  ScraperCountSeriesByKey,
  ScraperSeries,
  ScraperStatus,
} from '@app/types/api-dtos';
import { ChartData } from '@app/types/chart';

const start = new Date('2026-10-26T10:00:00.000Z');

const series: ScraperSeries[] = [
  {
    scraper: 'amazon-pdp-1',
    points: [
      {
        t: '2026-10-26T09:00:00.000Z',
        itemsPerSecond: 2,
        wastedPercent: 10,
        captchaPercent: 1,
        requests: 100,
      },
    ],
  },
];

const countPoint: ScraperCountPoint = {
  t: '2026-10-26T09:00:00.000Z',
  requests: 200,
  wasted: 20,
  captcha: 4,
  http503: 10,
  items: 50,
  itemAttempts: 75,
  proxyBytes: 3_145_728,
  directBytes: 1_048_576,
};

const countSeries: ScraperCountSeriesByKey = {
  country: [{ group: 'de', points: [countPoint] }],
  scraper: [{ group: 'amazon-pdp-1', points: [{ ...countPoint, wasted: 50 }] }],
};

const status: ScraperStatus = {
  scraper: 'amazon-pdp-1',
  lastReportAt: '2026-10-26T09:50:00.000Z',
  itemsPerSecond: 2,
  requestsPerSecond: 8,
  rps: 10,
  pending: 30,
  concurrency: 50,
  openConnections: 12,
};

const setup = () => {
  const api = {
    getSeries: vi.fn(() => of(series)),
    getCountSeries: vi.fn(() => of(countSeries)),
    getStatuses: vi.fn(() => of([status])),
  };
  const stores = [
    StatusStore,
    ItemsStore,
    WastedStore,
    CaptchaStore,
    Http503Store,
    AttemptsStore,
    TransferStore,
  ];
  TestBed.configureTestingModule({
    providers: [{ provide: ScrapersApiService, useValue: api }, ...stores],
  });
  const injected = {
    statuses: TestBed.inject(StatusStore),
    items: TestBed.inject(ItemsStore),
    wasted: TestBed.inject(WastedStore),
    captcha: TestBed.inject(CaptchaStore),
    http503: TestBed.inject(Http503Store),
    attempts: TestBed.inject(AttemptsStore),
    transfer: TestBed.inject(TransferStore),
  };
  TestBed.tick();

  return { api, ...injected };
};

describe('scraper stores', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => vi.useRealTimers());

  it('measure the statuses when they arrive', () => {
    const { statuses } = setup();

    expect(statuses.data()).toEqual([
      {
        ...status,
        lastReportAt: new Date('2026-10-26T09:50:00.000Z'),
        minutesAgo: 10,
        stopped: true,
      },
    ]);
  });

  it('derive one chart per metric', () => {
    const { items, wasted, captcha, http503, attempts, transfer } = setup();
    const values = (chart: ChartData | null | undefined) => {
      return chart?.series.map(({ label, points }) => [
        label,
        Math.max(...points.map((p) => p.value)),
      ]);
    };

    expect(items.data()?.unit).toBe('hour');
    expect(items.data()?.series[0].label).toBe('amazon-pdp-1');
    expect(items.data()?.series[0].points).toHaveLength(24);
    expect(values(wasted.chart())).toEqual([['de', 10]]);
    expect(values(captcha.chart())).toEqual([['de', 2]]);
    expect(values(http503.chart())).toEqual([['de', 5]]);
    expect(values(attempts.chart())).toEqual([['de', 1.5]]);
    expect(values(transfer.chart())).toEqual([
      ['de proxy', 3],
      ['de direct', 1],
    ]);
  });

  it('switch the countries of the transfer chart off and on without a reload', () => {
    const { api, transfer } = setup();
    const calls = api.getCountSeries.mock.calls.length;
    const hidden = () => transfer.chart()?.series.map((line) => line.hidden);

    expect(transfer.countries()).toEqual(['de']);
    expect(transfer.visibleCountries()).toEqual(['de']);
    expect(hidden()).toEqual([false, false]);

    transfer.setVisibleCountries([]);

    expect(transfer.visibleCountries()).toEqual([]);
    expect(hidden()).toEqual([true, true]);

    transfer.setVisibleCountries(['de']);

    expect(hidden()).toEqual([false, false]);
    expect(api.getCountSeries.mock.calls.length).toBe(calls);
  });

  it('switch a grouped chart between countries and scrapers without a reload', () => {
    const { api, wasted } = setup();
    const calls = api.getCountSeries.mock.calls.length;

    wasted.setGroup('scraper');

    expect(wasted.group()).toBe('scraper');
    expect(wasted.chart()?.series.map((s) => s.label)).toEqual(['amazon-pdp-1']);
    expect(Math.max(...(wasted.chart()?.series[0].points.map((p) => p.value) ?? []))).toBe(25);
    expect(api.getCountSeries.mock.calls.length).toBe(calls);
  });
});
