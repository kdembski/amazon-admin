import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { Scrapers } from '@app/features/scrapers/scrapers';
import { ScraperMetricSummary } from '@app/types/api-dtos';

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
});

const render = async (summaries: ScraperMetricSummary[]) => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      {
        provide: ScrapersApiService,
        useValue: { getSummaries: () => of(summaries), getSeries: () => of([]) },
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

    const rows = [...element.querySelectorAll('table tbody tr.mat-mdc-row')].map((row) =>
      [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim()),
    );
    expect(rows).toEqual([
      ['amazon-pdp-1', '2,50 (-0,30)', '1200', '12,35', '4,00', '9,50', '80,00', '—'],
      ['amazon-plp', '2,50 (-0,30)', '1200', '12,35', '4,00', '—', '80,00', '—'],
    ]);
  });

  it('shows "Brak danych" without scrapers', async () => {
    const element = await render([]);

    expect(element.textContent).toContain('Brak danych');
  });
});
