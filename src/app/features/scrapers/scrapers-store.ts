import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { map } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { chartStore, withChart } from '@app/shared/charts/chart-store';
import { withPolling } from '@app/shared/polling/with-polling';
import { ScraperCountKey, ScraperCountPoint } from '@app/types/api-dtos';
import { ScraperChartField } from '@app/types/scrapers';
import { TimeRange } from '@app/types/time-range';
import {
  attemptsPerItem,
  requestPercent,
  directMegabytes,
  proxyMegabytes,
  toCountSeries,
  toScraperSeries,
  toScraperStatuses,
} from './scraper-charts';

// Every panel has its own range, so each one loads on its own.
const series = () => {
  const api = inject(ScrapersApiService);

  return (range: TimeRange) => api.getSeries(range);
};

const seriesChart = (field: ScraperChartField) => {
  return chartStore(series, (dto, range, unit) => toScraperSeries(dto, range, unit, field));
};

const countSeries = () => {
  const api = inject(ScrapersApiService);

  return (range: TimeRange) => api.getCountSeries(range);
};

const countryChart = (lines: Record<string, (point: ScraperCountPoint) => number>) => {
  return chartStore(countSeries, (dto, range, unit) =>
    toCountSeries(dto.country, range, unit, lines),
  );
};

// One line per country or per scraper, switched without a reload.
const groupedChart = (value: (point: ScraperCountPoint) => number) => {
  return signalStore(
    withChart(countSeries, (dto, range, unit) => ({
      country: toCountSeries(dto.country, range, unit, { '': value }),
      scraper: toCountSeries(dto.scraper, range, unit, { '': value }),
    })),
    withState({ group: 'country' as ScraperCountKey }),
    withComputed(({ data, group }) => ({
      chart: computed(() => {
        const loaded = data();

        return loaded && { unit: loaded.unit, series: loaded.series[group()] };
      }),
    })),
    withMethods((store) => ({
      setGroup: (group: ScraperCountKey) => patchState(store, { group }),
    })),
  );
};

export const ItemsStore = seriesChart('itemsPerSecond');

export const WastedStore = groupedChart(requestPercent((point) => point.wasted));

export const CaptchaStore = groupedChart(requestPercent((point) => point.captcha));

export const Http503Store = groupedChart(requestPercent((point) => point.http503));

export const AttemptsStore = groupedChart(attemptsPerItem);

export const TransferStore = countryChart({ proxy: proxyMegabytes, direct: directMegabytes });

// The statuses ignore the range; their age is measured when they arrive.
export const StatusStore = signalStore(
  withPolling(() => {
    const api = inject(ScrapersApiService);

    return () => api.getStatuses().pipe(map((statuses) => toScraperStatuses(statuses, new Date())));
  }),
);
