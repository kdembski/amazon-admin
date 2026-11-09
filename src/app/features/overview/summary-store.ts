import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { map } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { withPolling } from '@app/shared/polling/with-polling';
import { loadLastHourAndDay } from '@app/shared/summary/summary';
import { toSummaryTiles } from './overview-summary';

export const SummaryStore = signalStore(
  withPolling(() => {
    const api = inject(StatsApiService);

    return () => loadLastHourAndDay((range) => api.getActivity(range).pipe(map(toSummaryTiles)));
  }),
);
