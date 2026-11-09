import { LegendItem } from 'chart.js';
import { pl } from 'date-fns/locale';
import { ChartOptionsInput, ChartSeries } from '@app/types/chart';
import { seriesColor } from './chart-colors';

export const toDatasets = (series: ChartSeries[], fill: boolean, pointLabels: boolean) => {
  return series.map((line, index) => {
    const color = seriesColor(index);

    return {
      label: line.label,
      hidden: line.hidden,
      data: line.points.map((point) => ({ x: point.t.getTime(), y: point.value })),
      borderColor: color,
      backgroundColor: fill ? `${color}33` : color,
      fill,
      borderWidth: 1.5,
      pointRadius: pointLabels ? 3 : 0,
      tension: 0.2,
    };
  });
};

export const toChartOptions = ({
  series,
  type,
  stacked,
  unit,
  pointLabels,
  text,
  grid,
}: ChartOptionsInput) => {
  return {
    maintainAspectRatio: false,
    animation: false as const,
    layout: { padding: { top: pointLabels ? 20 : 0 } },
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: series.length > 1,
        labels: {
          color: text,
          filter: (item: LegendItem) => !series[item.datasetIndex ?? 0].hidden,
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        stacked,
        offset: type === 'bar',
        time: { unit },
        adapters: { date: { locale: pl } },
        ticks: { color: text },
        grid: { color: grid },
      },
      y: {
        stacked,
        beginAtZero: true,
        ticks: { color: text },
        grid: { color: grid },
      },
    },
  };
};
