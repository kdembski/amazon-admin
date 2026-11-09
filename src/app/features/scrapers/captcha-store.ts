import { groupedChartStore } from './grouped-chart-store';
import { requestPercent } from './scraper-count-metrics';

export const CaptchaStore = groupedChartStore(requestPercent((point) => point.captcha));
