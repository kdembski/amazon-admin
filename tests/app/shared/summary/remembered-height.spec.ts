import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RememberedHeight } from '@app/shared/summary/remembered-height';

@Component({
  imports: [RememberedHeight],
  template: `<section appRememberedHeight="test-summary" [loaded]="loaded()"></section>`,
})
class Host {
  readonly loaded = signal(false);
}

const KEY = 'test-summary';

const render = async () => {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const section = (fixture.nativeElement as HTMLElement).querySelector('section')!;

  return { fixture, section, value: () => section.style.getPropertyValue('--remembered-height') };
};

describe('RememberedHeight', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => localStorage.clear());

  it('keeps the default height before the first load', async () => {
    const { value } = await render();

    expect(value()).toBe('');
  });

  it('uses the height of the previous load while loading', async () => {
    localStorage.setItem(KEY, JSON.stringify({ width: window.innerWidth, height: 321 }));

    const { value } = await render();

    expect(value()).toBe('321px');
  });

  it('ignores a height saved at another window width or unreadable', async () => {
    localStorage.setItem(KEY, JSON.stringify({ width: window.innerWidth + 1, height: 321 }));
    const otherWidth = await render();
    localStorage.setItem(KEY, 'not json');
    const broken = await render();

    expect(otherWidth.value()).toBe('');
    expect(broken.value()).toBe('');
  });

  it('drops the minimum height after the load and saves the real height', async () => {
    const { fixture, section, value } = await render();
    vi.spyOn(section, 'offsetHeight', 'get').mockReturnValue(428);

    fixture.componentInstance.loaded.set(true);
    await fixture.whenStable();

    expect(value()).toBe('0px');
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({
      width: window.innerWidth,
      height: 428,
    });
  });
});
