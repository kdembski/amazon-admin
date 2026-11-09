import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { ActivityStatsDto } from '@app/types/api-dtos';

export const START = new Date('2026-10-26T10:00:00.000Z');

export const activity: ActivityStatsDto = {
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

export const setupStore = <S>(store: Type<S>) => {
  const api = { getActivity: vi.fn(() => of(activity)) };
  TestBed.configureTestingModule({
    providers: [{ provide: StatsApiService, useValue: api }, store],
  });
  const injected = TestBed.inject(store);
  TestBed.tick();

  return { api, store: injected };
};
