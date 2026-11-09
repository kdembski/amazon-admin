import 'chartjs-adapter-date-fns';
import { Component, computed, input } from '@angular/core';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartSeries, ChartType } from '@app/types/chart';
import { Granularity } from '@app/types/time-range';
import { cssVar } from './chart-colors';
import { toChartOptions, toDatasets } from './chart-config';
import { pointLabelsPlugin } from './point-labels-plugin';

@Component({
  selector: 'app-time-series-chart',
  imports: [BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    @if (hasData()) {
      <div class="canvas">
        <canvas
          baseChart
          [type]="type()"
          [data]="data()"
          [options]="options()"
          [plugins]="plugins()"
        ></canvas>
      </div>
    } @else {
      <p class="empty">No data</p>
    }
  `,
  styleUrl: './time-series-chart.scss',
})
export class TimeSeriesChart {
  readonly series = input.required<ChartSeries[]>();
  readonly type = input<ChartType>('line');
  readonly stacked = input(false);
  readonly fill = input(false);
  readonly unit = input<Granularity>('hour');
  readonly pointLabels = input(false);

  protected readonly plugins = computed(() => (this.pointLabels() ? [pointLabelsPlugin] : []));

  protected readonly hasData = computed(() => {
    return this.series().some((series) => series.points.some((point) => point.value !== 0));
  });

  readonly data = computed(() => ({
    datasets: toDatasets(this.series(), this.fill(), this.pointLabels()),
  }));

  readonly options = computed(() => {
    return toChartOptions({
      series: this.series(),
      type: this.type(),
      stacked: this.stacked(),
      unit: this.unit(),
      pointLabels: this.pointLabels(),
      text: cssVar('--mat-sys-on-surface-variant', '#64748b'),
      grid: cssVar('--mat-sys-outline-variant', '#e2e8f0'),
    });
  });
}
