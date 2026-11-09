import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CountryToggle } from '@app/features/scrapers/country-toggle';
import { CountryToggleSource } from '@app/types/scrapers';

const render = async () => {
  const visibleCountries = signal(['de', 'pl']);
  const source = {
    countries: signal(['de', 'pl']),
    visibleCountries,
    setVisibleCountries: vi.fn((visible: string[]) => visibleCountries.set(visible)),
  } satisfies CountryToggleSource;
  const fixture = TestBed.createComponent(CountryToggle);
  fixture.componentRef.setInput('source', source);
  fixture.componentRef.setInput('label', 'Transfer countries');
  await fixture.whenStable();

  return { fixture, source, element: fixture.nativeElement as HTMLElement };
};

describe('CountryToggle', () => {
  it('shows every country with the visible ones checked', async () => {
    const { element } = await render();
    const toggles = [...element.querySelectorAll('mat-button-toggle')];

    expect(toggles.map((toggle) => toggle.textContent?.trim())).toEqual(['de', 'pl']);
    expect(toggles.every((toggle) => toggle.classList.contains('mat-button-toggle-checked'))).toBe(
      true,
    );
    expect(element.querySelector('mat-button-toggle-group')?.getAttribute('aria-label')).toBe(
      'Transfer countries',
    );
  });

  it('passes the countries left on to the source', async () => {
    const { fixture, source, element } = await render();

    element.querySelectorAll<HTMLButtonElement>('mat-button-toggle button')[0].click();
    await fixture.whenStable();

    expect(source.setVisibleCountries).toHaveBeenCalledWith(['pl']);
  });
});
