import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { formatNumber } from '@app/shared/format/format-number';
import { ScraperStatusRow } from '@app/types/scrapers';

const NO_LIMIT = 0;

@Component({
  selector: 'app-scraper-status-list',
  imports: [DatePipe, MatProgressBar, MatTableModule],
  templateUrl: './scraper-status-list.html',
  styleUrl: './scraper-status-list.scss',
})
export class ScraperStatusList {
  readonly rows = input.required<ScraperStatusRow[]>();

  protected readonly formatNumber = formatNumber;
  protected readonly columns = ['scraper', 'itemsPerSecond', 'rps', 'pending', 'openConnections'];

  protected limit(value: number) {
    return value === NO_LIMIT ? '∞' : formatNumber(value, 0);
  }

  protected usage(value: number, limit: number) {
    return limit === NO_LIMIT ? null : Math.min(100, (value / limit) * 100);
  }
}
