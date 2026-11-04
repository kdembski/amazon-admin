import { TestBed } from '@angular/core/testing';
import { BreakdownTable } from '@app/features/scrapers/breakdown-table';
import { ScraperBreakdown } from '@app/types/api-dtos';
import { BreakdownColumn } from '@app/types/scrapers';

const row: ScraperBreakdown = {
  scraper: 'amazon-pdp',
  group: 'pdp',
  itemsPerSecond: 1.5,
  requests: 1200,
  wastedPercent: 10,
  captchaPercent: 2,
  kbPerItem: 9,
  reusePercent: 75,
  attemptsPerItem: 1.25,
  bytesIn: 3_145_728,
  bytesOut: 524_288,
  connections: 300,
};

const render = async (rows: ScraperBreakdown[], columns: BreakdownColumn[]) => {
  const fixture = TestBed.createComponent(BreakdownTable);
  fixture.componentRef.setInput('rows', rows);
  fixture.componentRef.setInput('groupLabel', 'Flow');
  fixture.componentRef.setInput('columns', columns);
  await fixture.whenStable();

  return fixture.nativeElement as HTMLElement;
};

const texts = (element: HTMLElement, selector: string) => {
  return [...element.querySelectorAll(selector)].map((cell) => cell.textContent?.trim());
};

describe('BreakdownTable', () => {
  it('shows the scraper, the group and the given columns', async () => {
    const element = await render(
      [row],
      ['requests', 'bytesIn', 'bytesOut', 'connections', 'reusePercent'],
    );

    expect(texts(element, 'th')).toEqual([
      'Scraper',
      'Flow',
      'Requests',
      'In MB',
      'Out MB',
      'Połączenia',
      'Reuse %',
    ]);
    expect(texts(element, 'tr.mat-mdc-row td')).toEqual([
      'amazon-pdp',
      'pdp',
      '1200',
      '3,0',
      '0,5',
      '300',
      '75,00',
    ]);
  });

  it('shows the speed and quality columns', async () => {
    const element = await render(
      [row],
      ['itemsPerSecond', 'wastedPercent', 'captchaPercent', 'attemptsPerItem'],
    );

    expect(texts(element, 'tr.mat-mdc-row td').slice(2)).toEqual(['1,50', '10,00', '2,00', '1,25']);
  });

  it('shows "Brak danych" without rows', async () => {
    const element = await render([], ['requests']);

    expect(element.textContent).toContain('Brak danych');
  });
});
