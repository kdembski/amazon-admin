import { toScraperStatuses } from '@app/features/scrapers/scraper-statuses';
import { ScraperStatus } from '@app/types/api-dtos';

describe('toScraperStatuses', () => {
  const now = new Date('2026-10-26T12:00:00.000Z');
  const live = {
    itemsPerSecond: 2.5,
    requestsPerSecond: 9.8,
    rps: 10,
    pending: 40,
    concurrency: 50,
    openConnections: 25,
  };
  const status = (scraper: string, lastReportAt: string): ScraperStatus => ({
    scraper,
    lastReportAt,
    ...live,
  });

  it('marks a scraper silent for more than 5 minutes as stopped and keeps its rates', () => {
    expect(
      toScraperStatuses(
        [
          status('amazon-pdp', '2026-10-26T11:58:30.000Z'),
          status('amazon-plp', '2026-10-26T11:40:00.000Z'),
        ],
        now,
      ),
    ).toEqual([
      {
        scraper: 'amazon-pdp',
        lastReportAt: new Date('2026-10-26T11:58:30.000Z'),
        minutesAgo: 1,
        stopped: false,
        ...live,
      },
      {
        scraper: 'amazon-plp',
        lastReportAt: new Date('2026-10-26T11:40:00.000Z'),
        minutesAgo: 20,
        stopped: true,
        ...live,
      },
    ]);
  });

  it('shows 0 minutes for a report stamped after the load', () => {
    const [row] = toScraperStatuses([status('amazon-pdp', '2026-10-26T12:00:05.000Z')], now);

    expect(row).toMatchObject({ minutesAgo: 0, stopped: false });
  });
});
