import { signalStore } from '@ngrx/signals';
import { map } from 'rxjs';
import { apiLoad } from '@app/core/api/api-load';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { withPolling } from '@app/shared/polling/with-polling';
import { toScraperStatuses } from './scraper-statuses';

export const StatusStore = signalStore(
  withPolling(
    apiLoad(ScrapersApiService, (api) =>
      api.getStatuses().pipe(map((statuses) => toScraperStatuses(statuses, new Date()))),
    ),
  ),
);
