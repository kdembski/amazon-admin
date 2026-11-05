import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StatsApiService } from '@app/core/api/stats-api-service';

const range = { from: new Date('2026-10-26T00:00:00Z'), to: new Date('2026-10-26T12:00:00Z') };

describe('StatsApiService', () => {
  let api: StatsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(StatsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it.each([['getActivity', '/api/stats/activity']] as const)(
    '%s requests %s with the range as ISO strings',
    (method, url) => {
      let body: unknown;
      (api[method](range) as Observable<unknown>).subscribe((value) => (body = value));

      const request = http.expectOne((r) => r.url === url);
      expect(request.request.method).toBe('GET');
      expect(request.request.params.get('from')).toBe('2026-10-26T00:00:00.000Z');
      expect(request.request.params.get('to')).toBe('2026-10-26T12:00:00.000Z');
      request.flush({ ok: true });
      expect(body).toEqual({ ok: true });
    },
  );
});
