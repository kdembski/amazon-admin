import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { ScraperSummaryStore } from '@app/features/scrapers/scraper-summary-store';
import { ScraperMetricSummary } from '@app/types/api-dtos';
import { TimeRange } from '@app/types/time-range';

@Component({ template: '' })
class Blank {}

const now = new Date('2026-10-26T10:00:00.000Z');
const hourFrom = new Date('2026-10-26T09:00:00.000Z');

const summary = (requests: number) =>
  ({ scraper: 'amazon-pdp', requests, previousRequests: 10 }) as ScraperMetricSummary;

const setup = () => {
  const api = {
    getSummaries: vi.fn((range: TimeRange) =>
      of([summary(range.from.getTime() === hourFrom.getTime() ? 20 : 240)]),
    ),
  };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      { provide: ScrapersApiService, useValue: api },
      ScraperSummaryStore,
    ],
  });
  const store = TestBed.inject(ScraperSummaryStore);
  TestBed.tick();

  return { api, store };
};

describe('ScraperSummaryStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => vi.useRealTimers());

  it('loads the requests of the last hour and the last 24 h', () => {
    const { api, store } = setup();

    expect(api.getSummaries).toHaveBeenCalledWith({ from: hourFrom, to: now });
    expect(store.data()!.map((period) => [period.name, period.tiles[0].value])).toEqual([
      ['Ostatnia godzina', 20],
      ['Ostatnie 24 h', 240],
    ]);
  });
});
