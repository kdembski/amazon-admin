import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { Overview } from '@app/features/overview/overview';
import { ActivityStatsDto, LogStatsDto } from '@app/types/api-dtos';

@Component({ template: '' })
class Blank {}

const activity: ActivityStatsDto = {
  series: [],
  totals: { ad_scraped: 1234, country_outlier_sent: 2, price_drop_sent: 3 },
  previousTotals: { ad_scraped: 1000, country_outlier_sent: 0, price_drop_sent: 0 },
  countryOutlierChannels: [],
};

const logs: LogStatsDto = {
  series: [
    { level: 'error', points: [] },
    { level: 'warn', points: [] },
  ],
  totals: { error: 4, warn: 5 },
  previousTotals: { error: 0, warn: 0 },
  topSources: [{ source: 'AmazonAdService', error: 4, warn: 1 }],
};

const render = async (getActivity: () => Observable<ActivityStatsDto>) => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      { provide: StatsApiService, useValue: { getActivity, getLogs: () => of(logs) } },
    ],
  });
  const fixture = TestBed.createComponent(Overview);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
};

describe('Overview', () => {
  it('shows the last hour and last 24 h summaries, empty charts and the top log sources', async () => {
    const element = await render(() => of(activity));

    const summary = element.querySelector('.summary')!;
    const tiles = [...summary.querySelectorAll('.tile')].map((tile) =>
      tile.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(summary.textContent).toContain('Ostatnia godzina');
    expect(summary.textContent).toContain('Ostatnie 24 h');
    expect(summary.textContent).not.toContain('Błędy');
    expect(tiles).toHaveLength(6);
    expect(tiles[0]).toContain('Zebrane ogłoszenia');
    expect(tiles[0]).toContain('1234');
    expect(tiles[0]).toContain('+23%');
    expect(element.textContent).toContain('Brak danych');
    expect(element.querySelector('table')?.textContent).toContain('AmazonAdService');
  });

  it('shows the error of a first load that failed', async () => {
    const error = new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' });
    const element = await render(() => throwError(() => error));

    expect(element.querySelector('[role=alert]')?.textContent).toContain('503 Service Unavailable');
    expect(element.querySelector('.tile')).toBeNull();
  });
});
