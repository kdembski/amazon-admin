import { Component, computed, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { formatMegabytes, formatNumber } from '@app/shared/format/format-number';
import { ScraperBreakdown } from '@app/types/api-dtos';
import { BreakdownColumn } from '@app/types/scrapers';

@Component({
  selector: 'app-breakdown-table',
  imports: [MatTableModule],
  template: `
    <table mat-table [dataSource]="rows()">
      <ng-container matColumnDef="scraper">
        <th mat-header-cell *matHeaderCellDef>Scraper</th>
        <td mat-cell *matCellDef="let row">{{ row.scraper }}</td>
      </ng-container>
      <ng-container matColumnDef="group">
        <th mat-header-cell *matHeaderCellDef>{{ groupLabel() }}</th>
        <td mat-cell *matCellDef="let row">{{ row.group }}</td>
      </ng-container>
      <ng-container matColumnDef="requests">
        <th mat-header-cell *matHeaderCellDef>Requests</th>
        <td mat-cell *matCellDef="let row">{{ formatNumber(row.requests, 0) }}</td>
      </ng-container>
      <ng-container matColumnDef="itemsPerSecond">
        <th mat-header-cell *matHeaderCellDef>Items/s</th>
        <td mat-cell *matCellDef="let row">{{ formatNumber(row.itemsPerSecond) }}</td>
      </ng-container>
      <ng-container matColumnDef="wastedPercent">
        <th mat-header-cell *matHeaderCellDef>Wasted %</th>
        <td mat-cell *matCellDef="let row">{{ formatNumber(row.wastedPercent) }}</td>
      </ng-container>
      <ng-container matColumnDef="captchaPercent">
        <th mat-header-cell *matHeaderCellDef>Captcha %</th>
        <td mat-cell *matCellDef="let row">{{ formatNumber(row.captchaPercent) }}</td>
      </ng-container>
      <ng-container matColumnDef="attemptsPerItem">
        <th mat-header-cell *matHeaderCellDef>Attempts/item</th>
        <td mat-cell *matCellDef="let row">{{ formatNumber(row.attemptsPerItem) }}</td>
      </ng-container>
      <ng-container matColumnDef="bytesIn">
        <th mat-header-cell *matHeaderCellDef>In MB</th>
        <td mat-cell *matCellDef="let row">{{ formatMegabytes(row.bytesIn) }}</td>
      </ng-container>
      <ng-container matColumnDef="bytesOut">
        <th mat-header-cell *matHeaderCellDef>Out MB</th>
        <td mat-cell *matCellDef="let row">{{ formatMegabytes(row.bytesOut) }}</td>
      </ng-container>
      <ng-container matColumnDef="connections">
        <th mat-header-cell *matHeaderCellDef>Połączenia</th>
        <td mat-cell *matCellDef="let row">{{ formatNumber(row.connections, 0) }}</td>
      </ng-container>
      <ng-container matColumnDef="reusePercent">
        <th mat-header-cell *matHeaderCellDef>Reuse %</th>
        <td mat-cell *matCellDef="let row">{{ formatNumber(row.reusePercent) }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="allColumns()"></tr>
      <tr mat-row *matRowDef="let row; columns: allColumns()"></tr>
      <tr class="empty-row" *matNoDataRow>
        <td [attr.colspan]="allColumns().length">Brak danych</td>
      </tr>
    </table>
  `,
  styles: `
    .empty-row td {
      padding: 16px;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class BreakdownTable {
  readonly rows = input.required<ScraperBreakdown[]>();
  readonly groupLabel = input.required<string>();
  readonly columns = input.required<BreakdownColumn[]>();

  protected readonly allColumns = computed(() => ['scraper', 'group', ...this.columns()]);
  protected readonly formatNumber = formatNumber;
  protected readonly formatMegabytes = formatMegabytes;
}
