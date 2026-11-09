import { inject } from '@angular/core';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { chartStore } from '@app/shared/charts/chart-store';
import { TimeRange } from '@app/types/time-range';
import { toAdChangeSeries, toAnomalySeries, toScrapedSeries } from './overview-charts';

const activity = () => {
  const api = inject(StatsApiService);

  return (range: TimeRange) => api.getActivity(range);
};

export const ScrapedStore = chartStore(activity, toScrapedSeries);
export const AdChangeStore = chartStore(activity, toAdChangeSeries);
export const AnomalyStore = chartStore(activity, toAnomalySeries);
