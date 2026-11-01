import { DatePipe } from '@angular/common';
import { Component, effect, inject, viewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { formatNumber, formatSigned } from '@app/shared/format/format-number';
import { ScraperMetricSummary } from '@app/types/api-dtos';
import { ScrapersStore } from './scrapers-store';

@Component({
  selector: 'app-scrapers',
  imports: [DatePipe, MatSortModule, MatTableModule, TimeSeriesChart],
  providers: [ScrapersStore],
  templateUrl: './scrapers.html',
  styleUrl: './scrapers.scss',
})
export class Scrapers {
  protected readonly store = inject(ScrapersStore);
  protected readonly formatNumber = formatNumber;
  protected readonly formatSigned = formatSigned;
  protected readonly columns = [
    'scraper',
    'itemsPerSecond',
    'requests',
    'wastedPercent',
    'captchaPercent',
    'kbPerItem',
    'reusePercent',
    'attemptsPerItem',
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
