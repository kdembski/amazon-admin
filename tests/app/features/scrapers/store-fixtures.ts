import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import {
  ScraperCountPoint,
  ScraperCountSeriesByKey,
  ScraperSeries,
  ScraperStatus,
} from '@app/types/api-dtos';
import { ChartData } from '@app/types/chart';

export const series: ScraperSeries[] = [
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

export const countPoint: ScraperCountPoint = {
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

export const countSeries: ScraperCountSeriesByKey = {
  country: [{ group: 'de', points: [countPoint] }],
  scraper: [{ group: 'amazon-pdp-1', points: [{ ...countPoint, wasted: 50 }] }],
};

export const status: ScraperStatus = {
  scraper: 'amazon-pdp-1',
  lastReportAt: '2026-10-26T09:50:00.000Z',
  itemsPerSecond: 2,
  requestsPerSecond: 8,
  rps: 10,
  pending: 30,
  concurrency: 50,
  openConnections: 12,
};

export const START = new Date('2026-10-26T10:00:00.000Z');

export const maxValues = (chart: ChartData | null | undefined) => {
  return chart?.series.map(({ label, points }) => [label, Math.max(...points.map((p) => p.value))]);
};

export const setupStore = <S>(store: Type<S>) => {
  const api = {
    getSeries: vi.fn(() => of(series)),
    getCountSeries: vi.fn(() => of(countSeries)),
    getStatuses: vi.fn(() => of([status])),
  };
  TestBed.configureTestingModule({
    providers: [{ provide: ScrapersApiService, useValue: api }, store],
  });
  const injected = TestBed.inject(store);
  TestBed.tick();

  return { api, store: injected };
};
