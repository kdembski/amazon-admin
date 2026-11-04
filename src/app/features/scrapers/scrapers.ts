import { DatePipe } from '@angular/common';
import { Component, effect, inject, viewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { formatMegabytes, formatNumber, formatSigned } from '@app/shared/format/format-number';
import { SummaryPanels } from '@app/shared/summary/summary-panels';
import { ScraperMetricSummary } from '@app/types/api-dtos';
import { BreakdownColumn } from '@app/types/scrapers';
import { BreakdownTable } from './breakdown-table';
import { ScraperSummaryStore } from './scraper-summary-store';
import { ScrapersStore } from './scrapers-store';

@Component({
  selector: 'app-scrapers',
  imports: [
    BreakdownTable,
    DatePipe,
    MatSortModule,
    MatTableModule,
    SummaryPanels,
    TimeSeriesChart,
  ],
  providers: [ScrapersStore, ScraperSummaryStore],
  templateUrl: './scrapers.html',
  styleUrl: './scrapers.scss',
})
export class Scrapers {
  protected readonly store = inject(ScrapersStore);
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
      this.rows.data = this.store.rows();
      this.rows.sort = this.sort() ?? null;
    });
  }
}
