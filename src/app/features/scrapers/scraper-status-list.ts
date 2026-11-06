import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { formatNumber } from '@app/shared/format/format-number';
import { ScraperStatusRow } from '@app/types/scrapers';

// One table row per scraper: a status badge, then the last hour averages against their limits.
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

  // 0 means the scraper runs without a limit.
  protected limit(value: number) {
    return value === 0 ? '∞' : formatNumber(value, 0);
  }

  // Null without a limit to measure against, so the row shows no bar.
  protected usage(value: number, limit: number) {
    return limit ? Math.min(100, (value / limit) * 100) : null;
  }
}
