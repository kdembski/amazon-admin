import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { SummaryStore } from '@app/features/overview/summary-store';
import { ActivityStatsDto } from '@app/types/api-dtos';
import { TimeRange } from '@app/types/time-range';

@Component({ template: '' })
class Blank {}

const now = new Date('2026-10-26T10:00:00.000Z');
const hour = { from: new Date('2026-10-26T09:00:00.000Z'), to: now };
const day = { from: new Date('2026-10-25T10:00:00.000Z'), to: now };

const activity = (scraped: number): ActivityStatsDto => ({
  series: [],
  totals: { ad_scraped: scraped, country_outlier_sent: 0, price_drop_sent: 0 },
  previousTotals: { ad_scraped: 1, country_outlier_sent: 0, price_drop_sent: 0 },
  countryOutlierChannels: [],
});

const setup = () => {
  const api = {
    getActivity: vi.fn((range: TimeRange) =>
      of(activity(range.from.getTime() === hour.from.getTime() ? 2 : 30)),
    ),
  };
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      { provide: StatsApiService, useValue: api },
      SummaryStore,
    ],
  });
  const store = TestBed.inject(SummaryStore);
  TestBed.tick();
  return { api, store };
};

describe('SummaryStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => vi.useRealTimers());

  it('loads the last hour and the last 24 h', () => {
    const { api } = setup();

    expect(api.getActivity).toHaveBeenCalledWith(hour);
    expect(api.getActivity).toHaveBeenCalledWith(day);
  });

  it('builds the tiles of each period', () => {
    const { store } = setup();

    expect(store.data()!.map((p) => p.name)).toEqual(['Last hour', 'Last 24 h']);
    expect(store.data()![0].tiles[0]).toEqual({
      label: 'Scraped ads',
      value: 2,
      change: 100,
      details: [],
    });
    expect(store.data()![1].tiles[0]).toEqual({
      label: 'Scraped ads',
      value: 30,
      change: 2900,
      details: [],
    });
  });
});
