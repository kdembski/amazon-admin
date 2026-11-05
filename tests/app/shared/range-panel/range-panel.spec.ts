import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RangePanel } from '@app/shared/range-panel/range-panel';
import { RangePanelSource } from '@app/types/range-panel';
import { RangePreset } from '@app/types/time-range';

const source = (state: { data?: unknown; error?: string; staleSince?: Date } = {}) => {
  const preset = signal<RangePreset>('1d');

  return {
    data: signal(state.data ?? null),
    error: signal(state.error ?? null),
    staleSince: signal(state.staleSince ?? null),
    preset,
    setPreset: vi.fn((value: RangePreset) => preset.set(value)),
  } satisfies RangePanelSource;
};

const render = async (shown: RangePanelSource, ranged = true) => {
  const fixture = TestBed.createComponent(RangePanel);
  fixture.componentRef.setInput('heading', 'Scraped ads');
  fixture.componentRef.setInput('source', shown);
  fixture.componentRef.setInput('ranged', ranged);
  await fixture.whenStable();

  return { fixture, element: fixture.nativeElement as HTMLElement };
};

describe('RangePanel', () => {
  it('shows the heading, the presets with the current one checked and loading', async () => {
    const { element } = await render(source());

    const toggles = [...element.querySelectorAll('mat-button-toggle')];
    expect(element.querySelector('h2')?.textContent).toBe('Scraped ads');
    expect(toggles.map((toggle) => toggle.textContent?.trim())).toEqual(['1d', '7d', '30d']);
    expect(toggles[0].classList).toContain('mat-button-toggle-checked');
    expect(element.querySelector('.loading')).not.toBeNull();
  });

  it('passes a chosen preset to the source', async () => {
    const shown = source({ data: 1 });
    const { fixture, element } = await render(shown);

    element.querySelectorAll<HTMLButtonElement>('mat-button-toggle button')[2].click();
    await fixture.whenStable();

    expect(shown.setPreset).toHaveBeenCalledWith('30d');
    expect(element.querySelector('.loading')).toBeNull();
  });

  it('shows the error of a first load and the stale badge after a failed reload', async () => {
    const failed = await render(source({ error: '503 Service Unavailable' }));
    const stale = await render(
      source({ data: 1, error: '503', staleSince: new Date(2026, 9, 26, 9, 5) }),
    );

    expect(failed.element.querySelector('[role=alert]')?.textContent).toContain('503 Service');
    expect(stale.element.querySelector('[role=alert]')).toBeNull();
    expect(stale.element.querySelector('.stale')?.textContent).toContain('09:05');
  });

  it('keeps the chart height only in chart panels', async () => {
    const plain = await render(source());
    const chart = await render(source());
    chart.fixture.componentRef.setInput('chart', true);
    await chart.fixture.whenStable();

    expect(plain.element.querySelector('.body')?.classList).not.toContain('chart');
    expect(chart.element.querySelector('.body')?.classList).toContain('chart');
    expect(chart.element.querySelector('.loading')?.getAttribute('aria-label')).toBe('Loading');
  });

  it('hides the presets of data without a range', async () => {
    const { element } = await render(source(), false);

    expect(element.querySelector('mat-button-toggle-group')).toBeNull();
  });
});
