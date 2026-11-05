import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { map } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { chartStore } from '@app/shared/charts/chart-store';
import { withPolling } from '@app/shared/polling/with-polling';
import { ScraperBreakdownKey } from '@app/types/api-dtos';
import { ScraperChartField } from '@app/types/scrapers';
import { TimeRange } from '@app/types/time-range';
import { toScraperSeries, toScraperStatuses } from './scraper-charts';

// Every panel has its own range, so each one loads on its own.
const series = () => {
  const api = inject(ScrapersApiService);

  return (range: TimeRange) => api.getSeries(range);
};

const seriesChart = (field: ScraperChartField) => {
  return chartStore(series, (dto, range, unit) => toScraperSeries(dto, range, unit, field));
};

const breakdown = (by: ScraperBreakdownKey) => {
  return signalStore(
    withPolling(() => {
      const api = inject(ScrapersApiService);

      return (range: TimeRange) => api.getBreakdown(range, by);
    }),
  );
};

export const ItemsStore = seriesChart('itemsPerSecond');

export const WastedStore = seriesChart('wastedPercent');

export const CaptchaStore = seriesChart('captchaPercent');

export const FlowStore = breakdown('flow');

export const CountryStore = breakdown('country');

export const SummaryTableStore = signalStore(
  withPolling(() => {
    const api = inject(ScrapersApiService);

    return (range: TimeRange) => api.getSummaries(range);
  }),
);

// The statuses ignore the range; their age is measured when they arrive.
export const StatusStore = signalStore(
  withPolling(() => {
    const api = inject(ScrapersApiService);

    return () => api.getStatuses().pipe(map((statuses) => toScraperStatuses(statuses, new Date())));
  }),
);
