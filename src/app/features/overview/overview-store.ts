import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { map } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { chartStore } from '@app/shared/charts/chart-store';
import { withPolling } from '@app/shared/polling/with-polling';
import { TimeRange } from '@app/types/time-range';
import { toAdChangeSeries, toAnomalySeries, toLogSeries, toScrapedSeries } from './overview-charts';

// Every panel has its own range, so each one loads on its own.
const activity = () => {
  const api = inject(StatsApiService);

  return (range: TimeRange) => api.getActivity(range);
};

const logs = () => {
  const api = inject(StatsApiService);

  return (range: TimeRange) => api.getLogs(range);
};

export const ScrapedStore = chartStore(activity, toScrapedSeries);

export const AdChangeStore = chartStore(activity, toAdChangeSeries);

export const AnomalyStore = chartStore(activity, toAnomalySeries);

export const LogSeriesStore = chartStore(logs, toLogSeries);

export const TopSourcesStore = signalStore(
  withPolling(() => {
    const load = logs();

    return (range: TimeRange) => load(range).pipe(map((dto) => dto.topSources));
  }),
);
