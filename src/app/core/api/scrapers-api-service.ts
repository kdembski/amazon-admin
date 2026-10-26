import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ScraperMetricSummary, ScraperSeries } from '@app/types/api-dtos';
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
}
