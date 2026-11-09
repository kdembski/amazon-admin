import { Chart, Plugin } from 'chart.js';
import { formatCompact } from '@app/shared/format/format-number';

const drawDatasetLabels = (chart: Chart, index: number) => {
  const dataset = chart.data.datasets[index];

  chart.getDatasetMeta(index).data.forEach((element, i) => {
    const point = dataset.data[i] as { y: number };

    chart.ctx.fillText(formatCompact(point.y), element.x, element.y - 6);
  });
};

export const pointLabelsPlugin: Plugin = {
  id: 'pointLabels',
  afterDatasetsDraw: (chart) => {
    const ctx = chart.ctx;

    ctx.save();
    ctx.fillStyle = chart.options.scales?.['x']?.ticks?.color as string;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    chart.data.datasets.forEach((_, index) => {
      if (chart.isDatasetVisible(index)) {
        drawDatasetLabels(chart, index);
      }
    });
    ctx.restore();
  },
};
