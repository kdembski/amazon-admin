import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { ScrapersStore } from '@app/features/scrapers/scrapers-store';
import { ScraperMetricSummary, ScraperSeries } from '@app/types/api-dtos';

@Component({ template: '' })
class Blank {}

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
};

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
  const api = { getSummaries: vi.fn(() => of([summary])), getSeries: vi.fn(() => of(series)) };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      { provide: ScrapersApiService, useValue: api },
      ScrapersStore,
    ],
  });
  const store = TestBed.inject(ScrapersStore);
  TestBed.tick();

  return { api, store };
};

describe('ScrapersStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => vi.useRealTimers());

  it('loads summaries and series for the same range', () => {
    const { api } = setup();
    const range = { from: new Date(start.getTime() - 86_400_000), to: start };

    expect(api.getSummaries).toHaveBeenCalledWith(range);
    expect(api.getSeries).toHaveBeenCalledWith(range);
  });

  it('derives the table rows and the three charts', () => {
    const { store } = setup();

    expect(store.rows()).toEqual([summary]);
    expect(store.unit()).toBe('hour');
    expect(store.itemsSeries()[0].label).toBe('amazon-pdp-1');
    expect(store.itemsSeries()[0].points).toHaveLength(24);
    expect(store.wastedSeries()[0].points.some((p) => p.value === 10)).toBe(true);
    expect(store.captchaSeries()[0].points.some((p) => p.value === 1)).toBe(true);
  });
});
