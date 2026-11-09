import { groupedChartStore } from './grouped-chart-store';
import { attemptsPerItem } from './scraper-count-metrics';

export const AttemptsStore = groupedChartStore(attemptsPerItem);
