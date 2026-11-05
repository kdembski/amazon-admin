import { Component, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { RangePanel } from '@app/shared/range-panel/range-panel';
import { SummaryPanels } from '@app/shared/summary/summary-panels';
import {
  AdChangeStore,
  AnomalyStore,
  LogSeriesStore,
  ScrapedStore,
  TopSourcesStore,
} from './overview-store';
import { SummaryStore } from './summary-store';

@Component({
  selector: 'app-overview',
  imports: [MatTableModule, RangePanel, SummaryPanels, TimeSeriesChart],
  providers: [
    ScrapedStore,
    AdChangeStore,
    AnomalyStore,
    LogSeriesStore,
    TopSourcesStore,
    SummaryStore,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly scraped = inject(ScrapedStore);
  protected readonly adChange = inject(AdChangeStore);
  protected readonly anomalies = inject(AnomalyStore);
  protected readonly logSeries = inject(LogSeriesStore);
  protected readonly topSources = inject(TopSourcesStore);
  protected readonly summary = inject(SummaryStore);
  protected readonly sourceColumns = ['source', 'error', 'warn'];
}
