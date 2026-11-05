import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ActivityStatsDto } from '@app/types/api-dtos';
import { TimeRange } from '@app/types/time-range';
import { rangeParams } from './range-params';

@Service()
export class StatsApiService {
  private readonly http = inject(HttpClient);

  getActivity(range: TimeRange) {
    return this.http.get<ActivityStatsDto>('/api/stats/activity', { params: rangeParams(range) });
  }
}
