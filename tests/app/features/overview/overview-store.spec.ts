import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { OverviewStore } from '@app/features/overview/overview-store';
import { ActivityStatsDto, LogStatsDto } from '@app/types/api-dtos';

@Component({ template: '' })
class Blank {}

const start = new Date('2026-10-26T10:00:00.000Z');

const activity: ActivityStatsDto = {
  series: [
    { type: 'ad_scraped', channel: null, points: [{ t: '2026-10-26T09:00:00.000Z', value: 7 }] },
  ],
  totals: { ad_scraped: 7, country_outlier_sent: 0, price_drop_sent: 0 },
  previousTotals: { ad_scraped: 5, country_outlier_sent: 0, price_drop_sent: 0 },
};

const logs: LogStatsDto = {
  series: [
    { level: 'error', points: [] },
    { level: 'warn', points: [] },
  ],
  totals: { error: 0, warn: 0 },
  previousTotals: { error: 0, warn: 0 },
  topSources: [{ source: 'A', error: 1, warn: 2 }],
};

const setup = () => {
  const api = { getActivity: vi.fn(() => of(activity)), getLogs: vi.fn(() => of(logs)) };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      { provide: StatsApiService, useValue: api },
      OverviewStore,
    ],
  });
  const store = TestBed.inject(OverviewStore);
  TestBed.tick();
  return { api, store };
};

describe('OverviewStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => vi.useRealTimers());

  it('loads activity and logs for the same range', () => {
    const { api } = setup();
    const range = { from: new Date(start.getTime() - 86_400_000), to: start };

    expect(api.getActivity).toHaveBeenCalledWith(range);
    expect(api.getLogs).toHaveBeenCalledWith(range);
  });

  it('derives tiles, series and top sources from the loaded data', () => {
    const { store } = setup();

    expect(store.unit()).toBe('hour');
    expect(store.tiles()[0]).toEqual({ label: 'Zebrane ogłoszenia', value: 7, previous: 5 });
    expect(store.scrapedSeries()[0].points).toHaveLength(24);
    expect(store.anomalySeries()).toEqual([]);
    expect(store.logSeries().map((s) => s.label)).toEqual(['Błędy', 'Ostrzeżenia']);
    expect(store.topSources()).toEqual([{ source: 'A', error: 1, warn: 2 }]);
  });
});
