import { signalStore } from '@ngrx/signals';
import { map } from 'rxjs';
import { apiLoad } from '@app/core/api/api-load';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { withPolling } from '@app/shared/polling/with-polling';
import { loadLastHourAndDay } from '@app/shared/summary/summary';
import { toScraperTiles } from './scraper-tiles';

export const ScraperSummaryStore = signalStore(
  withPolling(
    apiLoad(ScrapersApiService, (api) =>
      loadLastHourAndDay((range) =>
        api.getSummaries(range).pipe(map((summaries) => toScraperTiles(summaries, range))),
      ),
    ),
  ),
);
