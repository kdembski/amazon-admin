import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import {
  CaptchaStore,
  CountryStore,
  FlowStore,
  ItemsStore,
  StatusStore,
  SummaryTableStore,
  WastedStore,
} from '@app/features/scrapers/scrapers-store';
import { ScraperBreakdown, ScraperMetricSummary, ScraperSeries } from '@app/types/api-dtos';

const start = new Date('2026-10-26T10:00:00.000Z');

const summary: ScraperMetricSummary = {
  scraper: 'amazon-pdp-1',
  itemsPerSecond: 2,
  itemsPerSecondDiff: 0.5,
  requests: 100,
  wastedPercent: 10,
  captchaPercent: 1,
  kbPerItem: 9,
  reusePercent: 80,
  attemptsPerItem: 1.2,
  bytesIn: 2048,
  bytesOut: 1024,
  connections: 20,
  previousRequests: 50,
};

const country: ScraperBreakdown = { ...summary, group: 'de' };

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

const setup = () => {
  const api = {
    getSummaries: vi.fn(() => of([summary])),
    getSeries: vi.fn(() => of(series)),
    getBreakdown: vi.fn((_range: unknown, by: string) =>
      of(by === 'country' ? [country] : [{ ...summary, group: 'pdp' }]),
    ),
    getStatuses: vi.fn(() =>
      of([{ scraper: 'amazon-pdp-1', lastReportAt: '2026-10-26T09:50:00.000Z' }]),
    ),
  };
  const stores = [
    StatusStore,
    SummaryTableStore,
    FlowStore,
    CountryStore,
    ItemsStore,
    WastedStore,
    CaptchaStore,
  ];
  TestBed.configureTestingModule({
    providers: [{ provide: ScrapersApiService, useValue: api }, ...stores],
  });
  const injected = {
    statuses: TestBed.inject(StatusStore),
    summaryTable: TestBed.inject(SummaryTableStore),
    flows: TestBed.inject(FlowStore),
    countries: TestBed.inject(CountryStore),
    items: TestBed.inject(ItemsStore),
    wasted: TestBed.inject(WastedStore),
    captcha: TestBed.inject(CaptchaStore),
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

  it('load the summaries and the breakdowns of the last day', () => {
    const { api, summaryTable, flows, countries } = setup();
    const range = { from: new Date(start.getTime() - 86_400_000), to: start };

    expect(api.getSummaries).toHaveBeenCalledWith(range);
    expect(api.getBreakdown).toHaveBeenCalledWith(range, 'country');
    expect(api.getBreakdown).toHaveBeenCalledWith(range, 'flow');
    expect(summaryTable.data()).toEqual([summary]);
    expect(countries.data()).toEqual([country]);
    expect(flows.data()?.[0].group).toBe('pdp');
  });

  it('measure the statuses when they arrive', () => {
    const { statuses } = setup();

    expect(statuses.data()).toEqual([
      {
        scraper: 'amazon-pdp-1',
        lastReportAt: new Date('2026-10-26T09:50:00.000Z'),
        minutesAgo: 10,
        stopped: true,
      },
    ]);
  });

  it('derive one chart per metric', () => {
    const { items, wasted, captcha } = setup();

    expect(items.data()?.unit).toBe('hour');
    expect(items.data()?.series[0].label).toBe('amazon-pdp-1');
    expect(items.data()?.series[0].points).toHaveLength(24);
    expect(wasted.data()?.series[0].points.some((p) => p.value === 10)).toBe(true);
    expect(captcha.data()?.series[0].points.some((p) => p.value === 1)).toBe(true);
  });
});
