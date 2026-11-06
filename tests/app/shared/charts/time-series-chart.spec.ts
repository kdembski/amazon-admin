import { TestBed } from '@angular/core/testing';
import { LegendItem } from 'chart.js';
import { TimeSeriesChart } from '@app/shared/charts/time-series-chart';
import { ChartSeries } from '@app/types/chart';

const t = new Date('2026-10-26T10:00:00.000Z');

const render = async (series: ChartSeries[], inputs: Record<string, unknown> = {}) => {
  const fixture = TestBed.createComponent(TimeSeriesChart);
  fixture.componentRef.setInput('series', series);
  Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
  await fixture.whenStable();
  return { chart: fixture.componentInstance, element: fixture.nativeElement as HTMLElement };
};

describe('TimeSeriesChart', () => {
  it.each([
    ['no series', []],
    ['only zeros', [{ label: 'A', points: [{ t, value: 0 }] }]],
  ])('shows "No data" for %s', async (_, series) => {
    const { element } = await render(series);

    expect(element.textContent).toContain('No data');
    expect(element.querySelector('canvas')).toBeNull();
  });

  it('draws the series as datasets on a time axis', async () => {
    const { chart, element } = await render(
      [
        { label: 'A', points: [{ t, value: 2 }] },
        { label: 'B', points: [{ t, value: 3 }] },
      ],
      { type: 'bar', stacked: true, unit: 'day' },
    );

    expect(element.querySelector('canvas[basechart]')).not.toBeNull();
    expect(element.querySelector('p-chart')).toBeNull();
    const data = chart.data();
    expect(data.datasets.map((d) => [d.label, d.data])).toEqual([
      ['A', [{ x: t.getTime(), y: 2 }]],
      ['B', [{ x: t.getTime(), y: 3 }]],
    ]);
    expect(data.datasets[0].backgroundColor).not.toBe(data.datasets[1].backgroundColor);
    const scales = chart.options().scales;
    expect(scales.x).toMatchObject({ type: 'time', stacked: true, time: { unit: 'day' } });
    expect(scales.y).toMatchObject({ stacked: true, beginAtZero: true });
    expect(chart.options().plugins.legend.display).toBe(true);
    expect(chart.options().animation).toBe(false);
  });

  it('hides the legend for a single series', async () => {
    const { chart } = await render([{ label: 'A', points: [{ t, value: 1 }] }]);

    expect(chart.options().plugins.legend.display).toBe(false);
  });

  it('hides a switched off series from the plot and the legend', async () => {
    const { chart } = await render([
      { label: 'A', points: [{ t, value: 1 }] },
      { label: 'B', hidden: true, points: [{ t, value: 1 }] },
    ]);
    const { filter } = chart.options().plugins.legend.labels;

    expect(chart.data().datasets.map((d) => d.hidden)).toEqual([undefined, true]);
    expect(filter({ datasetIndex: 0 } as LegendItem)).toBe(true);
    expect(filter({ datasetIndex: 1 } as LegendItem)).toBe(false);
  });

  it('is not stacked by default', async () => {
    const { chart } = await render([{ label: 'A', points: [{ t, value: 1 }] }]);

    expect(chart.options().scales.x).toMatchObject({ stacked: false, time: { unit: 'hour' } });
  });

  it('labels the points only when asked', async () => {
    const series = [{ label: 'A', points: [{ t, value: 1 }] }];
    const { chart } = await render(series);
    const labeled = await render(series, { pointLabels: true });

    expect(chart.data().datasets[0].pointRadius).toBe(0);
    expect(labeled.chart.data().datasets[0].pointRadius).toBe(3);
    expect(labeled.chart.options().layout.padding.top).toBe(20);
  });
});
