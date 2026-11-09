import { groupedChartStore } from './grouped-chart-store';
import { requestPercent } from './scraper-count-metrics';

export const WastedStore = groupedChartStore(requestPercent((point) => point.wasted));
