import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GroupedChartPanel } from '@app/features/scrapers/grouped-chart-panel';
import { ScraperCountKey } from '@app/types/api-dtos';
import { ChartData, GroupedChartPanelSource } from '@app/types/chart';
import { RangePreset } from '@app/types/time-range';

const t = new Date('2026-10-26T10:00:00.000Z');

const render = async () => {
  const chart: ChartData = { unit: 'hour', series: [{ label: 'de', points: [{ t, value: 4 }] }] };
  const source: GroupedChartPanelSource<ScraperCountKey> = {
    data: signal(chart),
    chart: signal(chart),
    error: signal(null),
    staleSince: signal(null),
    preset: signal<RangePreset>('1d'),
    setPreset: vi.fn(),
    group: signal<ScraperCountKey>('country'),
    setGroup: vi.fn(),
  };
  const fixture = TestBed.createComponent(GroupedChartPanel);
  fixture.componentRef.setInput('heading', 'Wasted %');
  fixture.componentRef.setInput('source', source);
  await fixture.whenStable();

  return fixture.nativeElement as HTMLElement;
};

describe('GroupedChartPanel', () => {
  it('shows the heading, the grouping toggle and the chart', async () => {
    const element = await render();

    expect(element.querySelector('h2')?.textContent).toBe('Wasted %');
    expect(
      element.querySelector('app-group-toggle mat-button-toggle-group')?.getAttribute('aria-label'),
    ).toBe('Wasted % grouping');
    expect(element.querySelector('canvas')).not.toBeNull();
  });
});
