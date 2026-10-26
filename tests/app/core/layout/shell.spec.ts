import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shell } from '@app/core/layout/shell';

describe('Shell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('renders the navigation links, the toolbar and the router outlet', async () => {
    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const links = [...element.querySelectorAll('nav a')].map((a) => [
      a.textContent?.trim(),
      a.getAttribute('href'),
    ]);
    expect(links).toEqual([
      ['Przegląd', '/'],
      ['Scrapery', '/scrapers'],
    ]);
    expect(element.querySelector('header.toolbar app-time-range-picker')).not.toBeNull();
    expect(element.querySelector('router-outlet')).not.toBeNull();
  });
});
