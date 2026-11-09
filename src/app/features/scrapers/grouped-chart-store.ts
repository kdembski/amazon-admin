import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { withChart } from '@app/shared/charts/chart-store';
import { ScraperCountKey, ScraperCountPoint } from '@app/types/api-dtos';
import { loadCountSeries } from './load-count-series';
import { toCountSeries } from './scraper-count-series';

export const groupedChartStore = (value: (point: ScraperCountPoint) => number) => {
  return signalStore(
    withChart(loadCountSeries, (dto, range, unit) => ({
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
