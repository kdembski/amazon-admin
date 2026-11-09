import { Component, inject } from '@angular/core';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { RangePanel } from '@app/shared/range-panel/range-panel';
import { SummarySection } from '@app/shared/summary/summary-section';
import { AdChangeStore } from './ad-change-store';
import { AnomalyStore } from './anomaly-store';
import { ScrapedStore } from './scraped-store';
import { SummaryStore } from './summary-store';

@Component({
  selector: 'app-overview',
  imports: [RangePanel, SummarySection, TimeSeriesChart],
  providers: [ScrapedStore, AdChangeStore, AnomalyStore, SummaryStore],
  host: { class: 'page' },
  templateUrl: './overview.html',
})
export class Overview {
  protected readonly scraped = inject(ScrapedStore);
  protected readonly adChange = inject(AdChangeStore);
  protected readonly anomalies = inject(AnomalyStore);
  protected readonly summary = inject(SummaryStore);
}
