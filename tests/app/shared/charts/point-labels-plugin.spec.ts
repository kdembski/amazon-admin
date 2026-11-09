import { Chart } from 'chart.js';
import { pointLabelsPlugin } from '@app/shared/charts/point-labels-plugin';

const fakeChart = (visible: boolean[]) => {
  const ctx = { save: vi.fn(), restore: vi.fn(), fillText: vi.fn() };
  const chart = {
    ctx,
    options: { scales: { x: { ticks: { color: 'gray' } } } },
    data: {
      datasets: visible.map((_, index) => ({ data: [{ y: 1500 * (index + 1) }] })),
    },
    isDatasetVisible: (index: number) => visible[index],
    getDatasetMeta: () => ({ data: [{ x: 10, y: 50 }] }),
  };

  return { chart: chart as unknown as Chart, ctx };
};

describe('pointLabelsPlugin', () => {
  it('writes the compact value above every point of the visible datasets', () => {
    const { chart, ctx } = fakeChart([true, false]);

    const draw = pointLabelsPlugin.afterDatasetsDraw as (chart: Chart) => void;

    draw(chart);

    expect(ctx.fillText).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).toHaveBeenCalledWith('2k', 10, 44);
    expect(ctx.restore).toHaveBeenCalled();
  });
});
