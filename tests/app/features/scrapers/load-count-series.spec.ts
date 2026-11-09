import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { loadCountSeries } from '@app/features/scrapers/load-count-series';

describe('loadCountSeries', () => {
  it('loads the count series of the range', () => {
    const api = { getCountSeries: vi.fn(() => of({ country: [], scraper: [] })) };
    const range = { from: new Date(0), to: new Date(1) };
    TestBed.configureTestingModule({ providers: [{ provide: ScrapersApiService, useValue: api }] });

    TestBed.runInInjectionContext(loadCountSeries)(range).subscribe();

    expect(api.getCountSeries).toHaveBeenCalledWith(range);
  });
});
