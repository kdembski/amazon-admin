import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GroupToggle } from '@app/features/scrapers/group-toggle';
import { ScraperCountKey } from '@app/types/api-dtos';
import { GroupedChartSource } from '@app/types/chart';

const render = async () => {
  const group = signal<ScraperCountKey>('country');
  const source = {
    group,
    setGroup: vi.fn((value: ScraperCountKey) => group.set(value)),
  } satisfies GroupedChartSource<ScraperCountKey>;
  const fixture = TestBed.createComponent(GroupToggle);
  fixture.componentRef.setInput('source', source);
  fixture.componentRef.setInput('label', 'Wasted % grouping');
  await fixture.whenStable();

  return { fixture, source, element: fixture.nativeElement as HTMLElement };
};

describe('GroupToggle', () => {
  it('shows the groupings with the current one checked', async () => {
    const { element } = await render();

    const toggles = [...element.querySelectorAll('mat-button-toggle')];
    expect(toggles.map((toggle) => toggle.textContent?.trim())).toEqual(['Country', 'Scraper']);
    expect(toggles[0].classList).toContain('mat-button-toggle-checked');
    expect(element.querySelector('mat-button-toggle-group')?.getAttribute('aria-label')).toBe(
      'Wasted % grouping',
    );
  });

  it('passes a chosen grouping to the source', async () => {
    const { fixture, source, element } = await render();

    element.querySelectorAll<HTMLButtonElement>('mat-button-toggle button')[1].click();
    await fixture.whenStable();

    expect(source.setGroup).toHaveBeenCalledWith('scraper');
    expect(element.querySelectorAll('mat-button-toggle')[1].classList).toContain(
      'mat-button-toggle-checked',
    );
  });
});
