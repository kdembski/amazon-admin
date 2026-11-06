import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { AdChangeStore, AnomalyStore, ScrapedStore } from '@app/features/overview/overview-store';
import { ActivityStatsDto } from '@app/types/api-dtos';

const start = new Date('2026-10-26T10:00:00.000Z');

const activity: ActivityStatsDto = {
  series: [
    { type: 'ad_scraped', channel: null, points: [{ t: '2026-10-26T09:00:00.000Z', value: 7 }] },
  ],
  totals: {
    ad_scraped: 7,
    country_outlier_sent: 0,
    price_drop_sent: 0,
    ad_created: 0,
    ad_deleted: 0,
  },
  previousTotals: {
    ad_scraped: 5,
    country_outlier_sent: 0,
    price_drop_sent: 0,
    ad_created: 0,
    ad_deleted: 0,
  },
  countryOutlierChannels: [],
};

const setup = () => {
  const api = { getActivity: vi.fn(() => of(activity)) };
  TestBed.configureTestingModule({
    providers: [
      { provide: StatsApiService, useValue: api },
      ScrapedStore,
      AdChangeStore,
      AnomalyStore,
    ],
  });
  const stores = {
    scraped: TestBed.inject(ScrapedStore),
    adChange: TestBed.inject(AdChangeStore),
    anomalies: TestBed.inject(AnomalyStore),
  };
  TestBed.tick();
  return { api, ...stores };
};

describe('overview stores', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => vi.useRealTimers());

  it('derive the charts from the last day', () => {
    const { scraped, adChange, anomalies } = setup();

    expect(scraped.data()?.unit).toBe('hour');
    expect(scraped.data()?.series[0].points).toHaveLength(24);
    expect(adChange.data()?.series.map((s) => s.label)).toEqual(['New ads', 'Deleted ads']);
    expect(anomalies.data()?.series).toEqual([]);
  });

  it('reload only the panel whose preset changed', () => {
    const { api, scraped } = setup();
    const calls = api.getActivity.mock.calls.length;

    scraped.setPreset('30d');
    TestBed.tick();

    expect(api.getActivity).toHaveBeenCalledTimes(calls + 1);
    expect(api.getActivity).toHaveBeenLastCalledWith({
      from: new Date(start.getTime() - 30 * 86_400_000),
      to: start,
    });
    expect(scraped.data()?.unit).toBe('day');
  });
});
