import { apiLoad } from '@app/core/api/api-load';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';

export const loadCountSeries = apiLoad(ScrapersApiService, (api, range) =>
  api.getCountSeries(range),
);
