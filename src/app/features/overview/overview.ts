import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Message } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { StatTile } from '@app/shared/stat-tile/stat-tile';
import { OverviewStore } from './overview-store';

@Component({
  selector: 'app-overview',
  imports: [DatePipe, Message, TableModule, Tag, StatTile, TimeSeriesChart],
  providers: [OverviewStore],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly store = inject(OverviewStore);
}
