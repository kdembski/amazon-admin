import { DatePipe } from '@angular/common';
import { Component, effect, inject, viewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { RangePanel } from '@app/shared/range-panel/range-panel';
import { formatMegabytes, formatNumber, formatSigned } from '@app/shared/format/format-number';
import { SummaryPanels } from '@app/shared/summary/summary-panels';
import { SummarySkeleton } from '@app/shared/summary/summary-skeleton';
import { ScraperMetricSummary } from '@app/types/api-dtos';
import { BreakdownColumn } from '@app/types/scrapers';
import { BreakdownTable } from './breakdown-table';
import { ScraperSummaryStore } from './scraper-summary-store';
import {
  CaptchaStore,
  CountryStore,
  FlowStore,
  ItemsStore,
  StatusStore,
  SummaryTableStore,
  WastedStore,
} from './scrapers-store';

@Component({
  selector: 'app-scrapers',
  imports: [
    BreakdownTable,
    DatePipe,
    MatSortModule,
    MatTableModule,
    RangePanel,
    SummaryPanels,
    SummarySkeleton,
    TimeSeriesChart,
  ],
  providers: [
    StatusStore,
    SummaryTableStore,
    FlowStore,
    CountryStore,
    ItemsStore,
    WastedStore,
    CaptchaStore,
    ScraperSummaryStore,
  ],
  templateUrl: './scrapers.html',
  styleUrl: './scrapers.scss',
})
export class Scrapers {
  protected readonly statuses = inject(StatusStore);
  protected readonly summaryTable = inject(SummaryTableStore);
  protected readonly flows = inject(FlowStore);
  protected readonly countries = inject(CountryStore);
  protected readonly items = inject(ItemsStore);
  protected readonly wasted = inject(WastedStore);
  protected readonly captcha = inject(CaptchaStore);
  protected readonly summary = inject(ScraperSummaryStore);
  protected readonly formatNumber = formatNumber;
  protected readonly formatSigned = formatSigned;
  protected readonly formatMegabytes = formatMegabytes;
  protected readonly columns = [
    'scraper',
    'itemsPerSecond',
    'requests',
    'wastedPercent',
    'captchaPercent',
    'kbPerItem',
    'reusePercent',
    'attemptsPerItem',
    'bytesIn',
    'bytesOut',
    'connections',
  ];
  protected readonly statusColumns = ['scraper', 'lastReportAt', 'status'];
  // Connections and bytes carry no country, so the country table leaves them out.
  protected readonly countryColumns: BreakdownColumn[] = [
    'requests',
    'itemsPerSecond',
    'wastedPercent',
    'captchaPercent',
    'attemptsPerItem',
  ];
  protected readonly flowColumns: BreakdownColumn[] = [
    'requests',
    'itemsPerSecond',
    'wastedPercent',
    'captchaPercent',
    'bytesIn',
    'bytesOut',
    'connections',
    'reusePercent',
  ];
  protected readonly rows = new MatTableDataSource<ScraperMetricSummary>();

  private readonly sort = viewChild(MatSort);

  constructor() {
    effect(() => {
      this.rows.data = this.summaryTable.data() ?? [];
      this.rows.sort = this.sort() ?? null;
    });
  }
}
