import { TestBed } from '@angular/core/testing';
import { StatTile } from '@app/shared/stat-tile/stat-tile';

const render = async (value: number, previous: number | null) => {
  const fixture = TestBed.createComponent(StatTile);
  fixture.componentRef.setInput('label', 'Zebrane ogłoszenia');
  fixture.componentRef.setInput('value', value);
  fixture.componentRef.setInput('previous', previous);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  return {
    text: element.textContent?.replace(/\s+/g, ' ').trim(),
    change: element.querySelector('.change'),
  };
};

describe('StatTile', () => {
  it('shows the label, the value in Polish format and the growth', async () => {
    const { text, change } = await render(11_200, 10_000);

    expect(text).toContain('Zebrane ogłoszenia');
    expect(text).toContain('11 200');
    expect(change?.textContent?.trim()).toBe('+12%');
    expect(change?.classList).toContain('up');
  });

  it('shows a drop', async () => {
    const { change } = await render(95, 100);

    expect(change?.textContent?.trim()).toBe('-5%');
    expect(change?.classList).toContain('down');
  });

  it.each([null, 0])('shows no change when the previous value is %s', async (previous) => {
    const { change } = await render(5, previous);

    expect(change).toBeNull();
  });
});
