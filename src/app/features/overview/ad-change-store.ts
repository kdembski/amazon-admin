import { chartStore } from '@app/shared/charts/chart-store';
import { loadActivity } from './load-activity';
import { toAdChangeSeries } from './overview-charts';

export const AdChangeStore = chartStore(loadActivity, toAdChangeSeries);
