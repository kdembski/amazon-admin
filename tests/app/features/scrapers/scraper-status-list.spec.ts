import { TestBed } from '@angular/core/testing';
import { ScraperStatusList } from '@app/features/scrapers/scraper-status-list';
import { ScraperStatusRow } from '@app/types/scrapers';

const status = (overrides: Partial<ScraperStatusRow> = {}): ScraperStatusRow => ({
  scraper: 'amazon-pdp-1',
  lastReportAt: new Date(2026, 9, 26, 11, 59),
  minutesAgo: 1,
  stopped: false,
  itemsPerSecond: 12.34,
  requestsPerSecond: 7.5,
  rps: 10,
  pending: 45,
  concurrency: 50,
  openConnections: 23,
  ...overrides,
});

const render = async (rows: ScraperStatusRow[]) => {
  const fixture = TestBed.createComponent(ScraperStatusList);
  fixture.componentRef.setInput('rows', rows);
  await fixture.whenStable();

  return fixture.nativeElement as HTMLElement;
};

const firstRow = (element: HTMLElement) => element.querySelector('tr.mat-mdc-row')!;

const cells = (row: Element) => {
  return [...row.querySelectorAll('td')].map((cell) => cell.textContent?.trim());
};

const bars = (row: Element) => {
  return [...row.querySelectorAll('mat-progress-bar')].map((bar) => [
    bar.getAttribute('aria-label'),
    bar.getAttribute('aria-valuenow'),
  ]);
};

describe('ScraperStatusList', () => {
  it('shows one table row per scraper with its rates against the limits', async () => {
    const element = await render([status()]);
    const row = firstRow(element);
    const headers = [...element.querySelectorAll('th')].map((th) => th.textContent?.trim());

    expect(headers).toEqual(['Scraper', 'Items/s', 'RPS', 'Pending', 'Connections']);
    expect(row.classList).not.toContain('stopped');
    expect(row.querySelector('.status')?.getAttribute('title')).toBe(
      'Running, last report 26.10 11:59',
    );
    expect(row.querySelector('.status')?.textContent?.trim()).toBe('Running');
    expect(cells(row)[0]).toContain('amazon-pdp-1');
    expect(cells(row).slice(1)).toEqual(['12,3', '7,5 / 10', '45 / 50', '23']);
  });

  it('shows the usage of the limits as bars, full above the limit', async () => {
    const element = await render([status({ requestsPerSecond: 12 })]);

    expect(bars(firstRow(element))).toEqual([
      ['amazon-pdp-1 RPS usage', '100'],
      ['amazon-pdp-1 pending usage', '90'],
    ]);
  });

  it('marks a stopped scraper and leaves out the bars without a limit', async () => {
    const element = await render([status({ stopped: true, minutesAgo: 20, rps: 0 })]);
    const row = firstRow(element);

    expect(row.classList).toContain('stopped');
    expect(row.querySelector('.status')?.textContent?.trim()).toBe('Stopped');
    expect(cells(row)[2]).toBe('7,5 / ∞');
    expect(bars(row)).toEqual([['amazon-pdp-1 pending usage', '90']]);
  });

  it('says so without reports', async () => {
    const element = await render([]);

    expect(element.querySelector('.empty-row')?.textContent).toContain(
      'No reports in the last 7 days',
    );
  });
});
