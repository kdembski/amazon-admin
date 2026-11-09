import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SummarySection } from '@app/shared/summary/summary-section';
import { SummaryPeriod, SummarySource } from '@app/types/summary';

const render = async (data: SummaryPeriod[] | null, error: string | null = null) => {
  const source: SummarySource = { data: signal(data), error: signal(error) };
  const fixture = TestBed.createComponent(SummarySection);
  fixture.componentRef.setInput('source', source);
  fixture.componentRef.setInput('label', 'Summary');
  fixture.componentRef.setInput('storageKey', 'test-summary-height');
  fixture.componentRef.setInput('defaultHeight', 300);
  await fixture.whenStable();

  return fixture.nativeElement as HTMLElement;
};

describe('SummarySection', () => {
  afterEach(() => localStorage.clear());

  it('shows the skeleton with the default height while loading', async () => {
    const element = await render(null);

    expect(element.querySelector('app-summary-skeleton')).not.toBeNull();
    expect(element.style.getPropertyValue('--remembered-height')).toBe('300px');
    expect(element.querySelector('section')?.getAttribute('aria-label')).toBe('Summary');
  });

  it('shows the panels once loaded', async () => {
    const element = await render([{ name: 'Last hour', tiles: [] }]);

    expect(element.querySelector('app-summary-panels')?.textContent).toContain('Last hour');
    expect(element.querySelector('app-summary-skeleton')).toBeNull();
  });

  it('shows an error without data', async () => {
    const element = await render(null, '500 Server Error');

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'Failed to load the summary: 500 Server Error',
    );
  });
});
