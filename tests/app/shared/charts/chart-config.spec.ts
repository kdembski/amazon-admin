import { LegendItem } from 'chart.js';
import { toChartOptions, toDatasets } from '@app/shared/charts/chart-config';
import { ChartOptionsInput } from '@app/types/chart';

const t = new Date('2026-10-26T10:00:00.000Z');
const series = [
  { label: 'A', points: [{ t, value: 2 }] },
  { label: 'B', hidden: true, points: [{ t, value: 3 }] },
];
const input: ChartOptionsInput = {
  series,
  type: 'bar',
  stacked: true,
  unit: 'day',
  pointLabels: false,
  text: 'black',
  grid: 'gray',
};

describe('toDatasets', () => {
  it('turns every series into a dataset with its own color', () => {
    const [a, b] = toDatasets(series, false, false);

    expect(a).toMatchObject({ label: 'A', data: [{ x: t.getTime(), y: 2 }], pointRadius: 0 });
    expect(b.hidden).toBe(true);
    expect(a.borderColor).not.toBe(b.borderColor);
  });

  it('fills with a transparent color and shows points for the labels', () => {
    const [a] = toDatasets(series, true, true);

    expect(a.backgroundColor).toBe(`${a.borderColor}33`);
    expect(a.pointRadius).toBe(3);
  });
});

describe('toChartOptions', () => {
  it('sets up a stacked time axis in the given unit', () => {
    const { scales } = toChartOptions(input);

    expect(scales.x).toMatchObject({
      type: 'time',
      stacked: true,
      offset: true,
      time: { unit: 'day' },
    });
    expect(scales.y).toMatchObject({ stacked: true, beginAtZero: true, grid: { color: 'gray' } });
  });

  it('leaves the switched off series out of the legend', () => {
    const { filter } = toChartOptions(input).plugins.legend.labels;

    expect(filter({ datasetIndex: 0 } as LegendItem)).toBe(true);
    expect(filter({ datasetIndex: 1 } as LegendItem)).toBe(false);
  });

  it('makes room for the point labels', () => {
    expect(toChartOptions({ ...input, pointLabels: true }).layout.padding.top).toBe(20);
  });
});
