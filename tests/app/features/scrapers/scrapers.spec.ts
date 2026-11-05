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
          getBreakdown: () => of([]),
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
  it('shows one table row per scraper with formatted values', async () => {
    const element = await render([summary('amazon-pdp-1', 9.5), summary('amazon-plp', null)]);

    const rows = [...element.querySelectorAll('table tbody tr.mat-mdc-row:not(.empty-row)')].map(
      (row) => [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim()),
    );
    expect(rows).toEqual([
      [
        'amazon-pdp-1',
        '2,50 (-0,30)',
        '1200',
        '12,35',
        '4,00',
        '9,50',
        '80,00',
        '—',
        '1,5',
        '0,0',
        '300',
      ],
      [
        'amazon-plp',
        '2,50 (-0,30)',
        '1200',
        '12,35',
        '4,00',
        '—',
        '80,00',
        '—',
        '1,5',
        '0,0',
        '300',
      ],
    ]);
  });

  it('shows requests, requests/s, items/s and transfer of the last hour and the last 24 h', async () => {
    const element = await render([summary('amazon-pdp-1', 9.5)]);

    const tiles = [...element.querySelectorAll('.tile')].map((tile) => tile.textContent);
    expect(tiles).toHaveLength(8);
    // Two columns: Requests and Requests/s on the left, Items/s and Transfer on the right.
    expect(tiles[0]).toContain('Requests');
    expect(tiles[0]).toContain('+100%');
    expect(tiles[0]).not.toContain('amazon-pdp-1');
    expect(tiles[1]).toContain('Requests/s');
    expect(tiles[1]).toContain('amazon-pdp-1');
    expect(tiles[1]).toContain('0,3');
    expect(tiles[2]).toContain('Items/s');
    expect(tiles[2]).toContain('2,50');
    expect(tiles[2]).toContain('-11%');
    expect(tiles[3]).toContain('Transfer in + out (MB)');
    expect(tiles[3]).toContain('3,0');
    expect(tiles[3]).toContain('Proxy');
    expect(tiles[3]).toContain('Direct');
  });

  it('marks a scraper without recent reports as stopped', async () => {
    const element = await render(
      [],
      [{ scraper: 'amazon-plp', lastReportAt: '2000-01-01T00:00:00.000Z' }],
    );

    expect(element.textContent).toContain('No reports for');
  });

  it('shows "No data" without scrapers', async () => {
    const element = await render([]);

    expect(element.textContent).toContain('No data');
  });
});
