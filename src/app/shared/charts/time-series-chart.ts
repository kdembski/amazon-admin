import 'chartjs-adapter-date-fns';
import { Component, computed, input } from '@angular/core';
import { pl } from 'date-fns/locale';
import { Plugin } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { formatCompact } from '@app/shared/format/format-number';
import { ChartSeries } from '@app/types/chart';
import { Granularity } from '@app/types/time-range';

// Tailwind-style 500 shades; readable on both the light and the dark theme.
const COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

// Material tokens are light-dark() pairs, which only a real color property resolves for the canvas.
const cssVar = (name: string, fallback: string) => {
  const probe = document.createElement('span');

  probe.style.color = `var(${name}, ${fallback})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();

  return color;
};

// Draws every point's value above it, e.g. "123k".
const pointLabels: Plugin = {
  id: 'pointLabels',
  afterDatasetsDraw: (chart) => {
    const ctx = chart.ctx;

    ctx.save();
    ctx.fillStyle = chart.options.scales?.['x']?.ticks?.color as string;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    chart.data.datasets.forEach((dataset, index) => {
      if (!chart.isDatasetVisible(index)) {
        return;
      }

      chart.getDatasetMeta(index).data.forEach((element, i) => {
        const point = dataset.data[i] as { y: number };

        ctx.fillText(formatCompact(point.y), element.x, element.y - 6);
      });
    });
    ctx.restore();
  },
};

@Component({
  selector: 'app-time-series-chart',
  imports: [BaseChartDirective],
  // Provided here, not in app.config, so Chart.js stays out of the initial bundle.
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
  readonly type = input<'line' | 'bar'>('line');
  readonly stacked = input(false);
  readonly fill = input(false);
  readonly unit = input<Granularity>('hour');
  readonly pointLabels = input(false);

  protected readonly plugins = computed(() => (this.pointLabels() ? [pointLabels] : []));

  protected readonly hasData = computed(() => {
    return this.series().some((series) => series.points.some((point) => point.value !== 0));
  });

  readonly data = computed(() => ({
    datasets: this.series().map((series, index) => {
      const color = COLORS[index % COLORS.length];

      return {
        label: series.label,
        data: series.points.map((point) => ({ x: point.t.getTime(), y: point.value })),
        borderColor: color,
        backgroundColor: this.fill() ? `${color}33` : color,
        fill: this.fill(),
        pointRadius: this.pointLabels() ? 3 : 0,
        tension: 0.2,
      };
    }),
  }));

  readonly options = computed(() => {
    const text = cssVar('--mat-sys-on-surface-variant', '#64748b');
    const grid = cssVar('--mat-sys-outline-variant', '#e2e8f0');

    return {
      maintainAspectRatio: false,
      animation: false as const,
      // Room for the point labels above the highest point.
      layout: { padding: { top: this.pointLabels() ? 20 : 0 } },
      interaction: { mode: 'index' as const, intersect: false },
      plugins: { legend: { display: this.series().length > 1, labels: { color: text } } },
      scales: {
        x: {
          type: 'time' as const,
          stacked: this.stacked(),
          offset: this.type() === 'bar',
          time: { unit: this.unit() },
          adapters: { date: { locale: pl } },
          ticks: { color: text },
          grid: { color: grid },
        },
        y: {
          stacked: this.stacked(),
          beginAtZero: true,
          ticks: { color: text },
          grid: { color: grid },
        },
      },
    };
  });
}
