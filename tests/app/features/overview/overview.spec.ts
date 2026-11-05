import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { Overview } from '@app/features/overview/overview';
import { ActivityStatsDto } from '@app/types/api-dtos';

@Component({ template: '' })
class Blank {}

const activity: ActivityStatsDto = {
  series: [],
  totals: {
    ad_scraped: 1234,
    country_outlier_sent: 2,
    price_drop_sent: 3,
    ad_created: 0,
    ad_deleted: 0,
  },
  previousTotals: {
    ad_scraped: 1000,
    country_outlier_sent: 0,
    price_drop_sent: 0,
    ad_created: 0,
    ad_deleted: 0,
  },
  countryOutlierChannels: [],
};

const render = async (getActivity: () => Observable<ActivityStatsDto>) => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      { provide: StatsApiService, useValue: { getActivity } },
    ],
  });
  const fixture = TestBed.createComponent(Overview);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
};

describe('Overview', () => {
  it('shows the last hour and last 24 h summaries, and empty charts', async () => {
    const element = await render(() => of(activity));

    const summary = element.querySelector('.summary')!;
    const tiles = [...summary.querySelectorAll('.tile')].map((tile) =>
      tile.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(summary.textContent).toContain('Last hour');
    expect(summary.textContent).toContain('Last 24 h');
    expect(summary.textContent).not.toContain('Errors');
    expect(tiles).toHaveLength(8);
    expect(tiles[1]).toContain('Ad balance');
    expect(tiles[3]).toContain('Price drops');
    expect(tiles[0]).toContain('Scraped ads');
    expect(tiles[0]).toContain('1234');
    expect(tiles[0]).toContain('+23%');
    expect(element.textContent).toContain('No data');
    expect(element.querySelectorAll('app-range-panel mat-button-toggle-group')).toHaveLength(3);
  });

  it('shows the error of a first load that failed', async () => {
    const error = new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' });
    const element = await render(() => throwError(() => error));

    expect(element.querySelector('[role=alert]')?.textContent).toContain('503 Service Unavailable');
    expect(element.querySelector('.tile')).toBeNull();
    expect(element.querySelectorAll('app-range-panel [role=alert]')).toHaveLength(3);
  });
});
