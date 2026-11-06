import { Component, inject } from '@angular/core';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { RangePanel } from '@app/shared/range-panel/range-panel';
import { RememberedHeight } from '@app/shared/summary/remembered-height';
import { SummaryPanels } from '@app/shared/summary/summary-panels';
import { SummarySkeleton } from '@app/shared/summary/summary-skeleton';
import { AdChangeStore, AnomalyStore, ScrapedStore } from './overview-store';
import { SummaryStore } from './summary-store';

@Component({
  selector: 'app-overview',
  imports: [RangePanel, RememberedHeight, SummaryPanels, SummarySkeleton, TimeSeriesChart],
  providers: [ScrapedStore, AdChangeStore, AnomalyStore, SummaryStore],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly scraped = inject(ScrapedStore);
  protected readonly adChange = inject(AdChangeStore);
  protected readonly anomalies = inject(AnomalyStore);
  protected readonly summary = inject(SummaryStore);
}
