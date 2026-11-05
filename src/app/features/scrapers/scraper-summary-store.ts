import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { map } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { withPolling } from '@app/shared/polling/with-polling';
import { loadLastHourAndDay } from '@app/shared/summary/summary';
import { toRequestTiles } from './scraper-charts';

export const ScraperSummaryStore = signalStore(
  withPolling(() => {
    const api = inject(ScrapersApiService);

    return () => loadLastHourAndDay((range) => api.getSummaries(range).pipe(map(toRequestTiles)));
  }),
);
