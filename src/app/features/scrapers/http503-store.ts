import { groupedChartStore } from './grouped-chart-store';
import { requestPercent } from './scraper-count-metrics';

export const Http503Store = groupedChartStore(requestPercent((point) => point.http503));
