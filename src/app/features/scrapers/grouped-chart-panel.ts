import { Component, input } from '@angular/core';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { RangePanel } from '@app/shared/range-panel/range-panel';
import { ScraperCountKey } from '@app/types/api-dtos';
import { GroupedChartPanelSource } from '@app/types/chart';
import { GroupToggle } from './group-toggle';

@Component({
  selector: 'app-grouped-chart-panel',
  imports: [GroupToggle, RangePanel, TimeSeriesChart],
  template: `
    <app-range-panel [heading]="heading()" [source]="source()" [chart]="true">
      <app-group-toggle panelActions [source]="source()" [label]="heading() + ' grouping'" />
      @if (source().chart(); as chart) {
        <app-time-series-chart [series]="chart.series" [unit]="chart.unit" />
      }
    </app-range-panel>
  `,
})
export class GroupedChartPanel {
  readonly heading = input.required<string>();
  readonly source = input.required<GroupedChartPanelSource<ScraperCountKey>>();
}
