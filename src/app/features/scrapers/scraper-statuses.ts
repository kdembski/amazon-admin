import { MINUTE } from '@app/shared/time-range/time-range';
import { ScraperStatus } from '@app/types/api-dtos';
import { ScraperStatusRow } from '@app/types/scrapers';

const STOPPED_AFTER_MS = 5 * MINUTE;

export const toScraperStatuses = (statuses: ScraperStatus[], now: Date): ScraperStatusRow[] => {
  return statuses.map((status) => {
    const age = now.getTime() - Date.parse(status.lastReportAt);

    return {
      ...status,
      lastReportAt: new Date(status.lastReportAt),
      minutesAgo: Math.max(0, Math.floor(age / MINUTE)),
      stopped: age > STOPPED_AFTER_MS,
    };
  });
};
