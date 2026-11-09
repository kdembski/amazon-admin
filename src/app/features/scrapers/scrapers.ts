import { Component, inject } from '@angular/core';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { RangePanel } from '@app/shared/range-panel/range-panel';
import { SummarySection } from '@app/shared/summary/summary-section';
import { AttemptsStore } from './attempts-store';
import { CaptchaStore } from './captcha-store';
import { CountryToggle } from './country-toggle';
import { GroupedChartPanel } from './grouped-chart-panel';
import { Http503Store } from './http503-store';
import { ItemsStore } from './items-store';
import { ScraperStatusList } from './scraper-status-list';
import { ScraperSummaryStore } from './scraper-summary-store';
import { StatusStore } from './status-store';
import { TransferStore } from './transfer-store';
import { WastedStore } from './wasted-store';

@Component({
  selector: 'app-scrapers',
  imports: [
    CountryToggle,
    GroupedChartPanel,
    RangePanel,
    ScraperStatusList,
    SummarySection,
    TimeSeriesChart,
  ],
  providers: [
    StatusStore,
    ItemsStore,
    WastedStore,
    CaptchaStore,
    Http503Store,
    AttemptsStore,
    TransferStore,
    ScraperSummaryStore,
  ],
  host: { class: 'page' },
  templateUrl: './scrapers.html',
})
export class Scrapers {
  protected readonly statuses = inject(StatusStore);
  protected readonly items = inject(ItemsStore);
  protected readonly wasted = inject(WastedStore);
  protected readonly captcha = inject(CaptchaStore);
  protected readonly http503 = inject(Http503Store);
  protected readonly attempts = inject(AttemptsStore);
  protected readonly transfer = inject(TransferStore);
  protected readonly summary = inject(ScraperSummaryStore);
}
