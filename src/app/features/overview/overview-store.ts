import { computed, inject } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';
import { forkJoin, map } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { withPolling } from '@app/shared/polling/with-polling';
import { granularity } from '@app/shared/time-range/time-range';
import { OverviewData } from '@app/types/overview';
import { TimeRange } from '@app/types/time-range';
import { toAnomalySeries, toLogSeries, toScrapedSeries, toTiles } from './overview-charts';

export const OverviewStore = signalStore(
  withPolling(() => {
    const api = inject(StatsApiService);

    // The range travels with the data so the charts span exactly what was loaded.
    return (range: TimeRange) => {
      return forkJoin({ activity: api.getActivity(range), logs: api.getLogs(range) }).pipe(
        map((loaded): OverviewData => ({ ...loaded, range })),
      );
    };
  }),
  withComputed(({ data }) => {
    const unit = computed(() => {
      const loaded = data();

      return loaded ? granularity(loaded.range) : 'hour';
    });
    const chart = <T>(build: (loaded: OverviewData) => T, empty: T) => {
      return computed(() => {
        const loaded = data();

        return loaded ? build(loaded) : empty;
      });
    };

    return {
      unit,
      tiles: chart((loaded) => toTiles(loaded.activity, loaded.logs), []),
      scrapedSeries: chart((loaded) => toScrapedSeries(loaded.activity, loaded.range, unit()), []),
      anomalySeries: chart((loaded) => toAnomalySeries(loaded.activity, loaded.range, unit()), []),
      logSeries: chart((loaded) => toLogSeries(loaded.logs, loaded.range, unit()), []),
      topSources: chart((loaded) => loaded.logs.topSources, []),
    };
  }),
);
