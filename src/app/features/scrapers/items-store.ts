import { apiLoad } from '@app/core/api/api-load';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { chartStore } from '@app/shared/charts/chart-store';
import { toScraperSeries } from './scraper-series';

export const ItemsStore = chartStore(
  apiLoad(ScrapersApiService, (api, range) => api.getSeries(range)),
  (dto, range, unit) => toScraperSeries(dto, range, unit, 'itemsPerSecond'),
);
