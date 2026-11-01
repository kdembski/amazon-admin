import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { StatTile } from '@app/shared/stat-tile/stat-tile';
import { OverviewStore } from './overview-store';

@Component({
  selector: 'app-overview',
  imports: [DatePipe, MatTableModule, StatTile, TimeSeriesChart],
  providers: [OverviewStore],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly store = inject(OverviewStore);
  protected readonly sourceColumns = ['source', 'error', 'warn'];
}
