import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { Scrapers } from '@app/features/scrapers/scrapers';
import { ScraperMetricSummary, ScraperStatus } from '@app/types/api-dtos';

@Component({ template: '' })
class Blank {}

const summary = (scraper: string, kbPerItem: number | null): ScraperMetricSummary => ({
  scraper,
  itemsPerSecond: 2.5,
  itemsPerSecondDiff: -0.3,
  requests: 1200,
  wastedPercent: 12.345,
  captchaPercent: 4,
  kbPerItem,
  reusePercent: 80,
  attemptsPerItem: null,
  bytesIn: 1_572_864,
  bytesOut: 0,
  connections: 300,
  previousRequests: 600,
  proxyBytes: 2_097_152,
  previousProxyBytes: 1_048_576,
  directBytes: 1_048_576,
  previousDirectBytes: 0,
});

const render = async (summaries: ScraperMetricSummary[], statuses: ScraperStatus[] = []) => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      {
        provide: ScrapersApiService,
        useValue: {
          getSummaries: () => of(summaries),
          getSeries: () => of([]),
          getCountSeries: () => of({ country: [], scraper: [] }),
          getStatuses: () => of(statuses),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(Scrapers);
  await fixture.whenStable();

  return fixture.nativeElement as HTMLElement;
};

describe('Scrapers', () => {
  it('shows requests, requests/s, items/s and transfer of the last hour and the last 24 h', async () => {
    const element = await render([summary('amazon-pdp-1', 9.5)]);

    const tiles = [...element.querySelectorAll('.tile')].map((tile) => tile.textContent);
    expect(tiles).toHaveLength(8);
    const columns = [...element.querySelector('.panel')!.querySelectorAll('.column')];
    expect(columns.map((column) => column.querySelectorAll('.tile').length)).toEqual([3, 1]);
    expect(tiles[0]).toContain('Requests');
    expect(tiles[0]).toContain('+100%');
    expect(tiles[0]).not.toContain('amazon-pdp-1');
    expect(tiles[1]).toContain('Requests/s');
    expect(tiles[1]).not.toContain('amazon-pdp-1');
    expect(tiles[1]).toContain('0,3');
    expect(tiles[2]).toContain('Items/s');
    expect(tiles[2]).not.toContain('amazon-pdp-1');
    expect(tiles[2]).toContain('2,50');
    expect(tiles[2]).toContain('-11%');
    expect(tiles[3]).toContain('Transfer in + out (MB)');
    expect(tiles[3]).toContain('3,0');
    expect(tiles[3]).toContain('Proxy');
    expect(tiles[3]).toContain('Direct');
  });

  it('shows the status of every scraper', async () => {
    const element = await render(
      [],
      [
        {
          scraper: 'amazon-plp',
          lastReportAt: '2000-01-01T00:00:00.000Z',
          itemsPerSecond: 0,
          requestsPerSecond: 0,
          rps: 0,
          pending: 0,
          concurrency: 10,
          openConnections: 0,
        },
      ],
    );

    expect(element.querySelector('app-range-panel h2')?.textContent).toBe(
      'Status (last hour average)',
    );
    expect(element.querySelector('tr.stopped .status')?.textContent).toContain('Stopped');
  });

  it('has only the status table', async () => {
    const element = await render([summary('amazon-pdp-1', 9.5)]);

    expect(element.querySelectorAll('table')).toHaveLength(1);
  });
});
