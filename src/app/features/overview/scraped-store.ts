import { chartStore } from '@app/shared/charts/chart-store';
import { loadActivity } from './load-activity';
import { toScrapedSeries } from './overview-charts';

export const ScrapedStore = chartStore(loadActivity, toScrapedSeries);
