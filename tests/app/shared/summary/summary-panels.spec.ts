import { TestBed } from '@angular/core/testing';
import { SummaryPanels } from '@app/shared/summary/summary-panels';
import { SummaryPeriod } from '@app/types/summary';

const periods: SummaryPeriod[] = [
  {
    name: 'Ostatnia godzina',
    tiles: [
      {
        label: 'Requesty',
        value: 1234,
        change: 25,
        details: [{ label: 'amazon-pdp', value: 1000, change: -10 }],
      },
      { label: 'Price drops', value: 3, change: null, details: [] },
    ],
  },
];

const render = async (shown = periods) => {
  const fixture = TestBed.createComponent(SummaryPanels);
  fixture.componentRef.setInput('periods', shown);
  await fixture.whenStable();

  return fixture.nativeElement as HTMLElement;
};

describe('SummaryPanels', () => {
  it('shows a titled panel of tiles per period', async () => {
    const element = await render();

    expect(element.querySelector('h2')?.textContent).toBe('Ostatnia godzina');
    expect(element.querySelectorAll('.tile')).toHaveLength(2);
  });

  it('shows the values with their change and the details', async () => {
    const element = await render();
    const [first, second] = element.querySelectorAll('.tile');

    expect(first.querySelector('.headline')?.textContent).toContain('1234');
    expect(first.querySelector('.headline .change.up')?.textContent?.trim()).toBe('+25%');
    expect(first.querySelector('.detail')?.textContent).toContain('amazon-pdp');
    expect(first.querySelector('.detail .change.down')?.textContent?.trim()).toBe('-10%');
    expect(second.querySelector('.change')).toBeNull();
    expect(second.querySelector('.details')).toBeNull();
  });

  it('lets a tile with more than 2 details take two rows', async () => {
    const detail = (label: string) => ({ label, value: 1, change: null });
    const element = await render([
      {
        name: 'Ostatnia godzina',
        tiles: [
          { label: 'Zebrane', value: 1, change: null, details: [detail('a')] },
          {
            label: 'Outliers',
            value: 3,
            change: null,
            details: [detail('a'), detail('b'), detail('c')],
          },
        ],
      },
    ]);

    const tall = [...element.querySelectorAll('.tile')].map((t) => t.classList.contains('tall'));
    expect(tall).toEqual([false, true]);
  });

  it('drops the change column of details without any change', async () => {
    const element = await render([
      {
        name: 'Ostatnia godzina',
        tiles: [
          {
            label: 'Country outliers',
            value: 2,
            change: null,
            details: [{ label: 'outliers-de', value: 2, change: null }],
          },
        ],
      },
    ]);

    expect(element.querySelector('.details.with-change')).toBeNull();
    expect(element.querySelectorAll('.detail dd')).toHaveLength(1);
  });
});
