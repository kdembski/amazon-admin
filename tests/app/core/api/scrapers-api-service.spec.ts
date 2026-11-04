import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';

const range = { from: new Date('2026-10-26T00:00:00Z'), to: new Date('2026-10-26T12:00:00Z') };

describe('ScrapersApiService', () => {
  let api: ScrapersApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ScrapersApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it.each([
    ['getSummaries', '/api/scrapers/summaries'],
    ['getSeries', '/api/scrapers/series'],
  ] as const)('%s requests %s with the range as ISO strings', (method, url) => {
    let body: unknown;
    (api[method](range) as Observable<unknown>).subscribe((value) => (body = value));

    const request = http.expectOne((r) => r.url === url);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('from')).toBe('2026-10-26T00:00:00.000Z');
    expect(request.request.params.get('to')).toBe('2026-10-26T12:00:00.000Z');
    request.flush({ ok: true });
    expect(body).toEqual({ ok: true });
  });

  it('getBreakdown requests /api/scrapers/breakdown with the range and the key', () => {
    api.getBreakdown(range, 'country').subscribe();

    const request = http.expectOne((r) => r.url === '/api/scrapers/breakdown');
    expect(request.request.params.get('from')).toBe('2026-10-26T00:00:00.000Z');
    expect(request.request.params.get('to')).toBe('2026-10-26T12:00:00.000Z');
    expect(request.request.params.get('by')).toBe('country');
    request.flush([]);
  });

  it('getStatuses requests /api/scrapers/statuses', () => {
    let body: unknown;
    api.getStatuses().subscribe((value) => (body = value));

    http.expectOne('/api/scrapers/statuses').flush([{ scraper: 'a', lastReportAt: 't' }]);
    expect(body).toEqual([{ scraper: 'a', lastReportAt: 't' }]);
  });
});
