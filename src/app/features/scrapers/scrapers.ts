import { Component, inject } from '@angular/core';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { RangePanel } from '@app/shared/range-panel/range-panel';
import { RememberedHeight } from '@app/shared/summary/remembered-height';
import { SummaryPanels } from '@app/shared/summary/summary-panels';
import { SummarySkeleton } from '@app/shared/summary/summary-skeleton';
import { GroupToggle } from './group-toggle';
import { ScraperStatusList } from './scraper-status-list';
import { ScraperSummaryStore } from './scraper-summary-store';
import {
  AttemptsStore,
  CaptchaStore,
  Http503Store,
  ItemsStore,
  StatusStore,
  TransferStore,
  WastedStore,
} from './scrapers-store';

@Component({
  selector: 'app-scrapers',
  imports: [
    GroupToggle,
    RangePanel,
    RememberedHeight,
    ScraperStatusList,
    SummaryPanels,
    SummarySkeleton,
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
  templateUrl: './scrapers.html',
  styleUrl: './scrapers.scss',
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
