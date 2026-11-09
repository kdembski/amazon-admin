import { chartStore } from '@app/shared/charts/chart-store';
import { loadActivity } from './load-activity';
import { toAnomalySeries } from './overview-charts';

export const AnomalyStore = chartStore(loadActivity, toAnomalySeries);
