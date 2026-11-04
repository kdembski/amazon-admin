import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import {
  ScraperBreakdown,
  ScraperBreakdownKey,
  ScraperMetricSummary,
  ScraperSeries,
  ScraperStatus,
} from '@app/types/api-dtos';
import { TimeRange } from '@app/types/time-range';
import { rangeParams } from './range-params';

@Service()
export class ScrapersApiService {
  private readonly http = inject(HttpClient);

  getSummaries(range: TimeRange) {
    return this.http.get<ScraperMetricSummary[]>('/api/scrapers/summaries', {
      params: rangeParams(range),
    });
  }

  getSeries(range: TimeRange) {
    return this.http.get<ScraperSeries[]>('/api/scrapers/series', { params: rangeParams(range) });
  }

  getBreakdown(range: TimeRange, by: ScraperBreakdownKey) {
    return this.http.get<ScraperBreakdown[]>('/api/scrapers/breakdown', {
      params: { ...rangeParams(range), by },
    });
  }

  getStatuses() {
    return this.http.get<ScraperStatus[]>('/api/scrapers/statuses');
  }
}
