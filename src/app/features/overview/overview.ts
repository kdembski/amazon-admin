import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { SummaryPanels } from '@app/shared/summary/summary-panels';
import { OverviewStore } from './overview-store';
import { SummaryStore } from './summary-store';

@Component({
  selector: 'app-overview',
  imports: [DatePipe, MatTableModule, SummaryPanels, TimeSeriesChart],
  providers: [OverviewStore, SummaryStore],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly store = inject(OverviewStore);
  protected readonly summary = inject(SummaryStore);
  protected readonly sourceColumns = ['source', 'error', 'warn'];
}
