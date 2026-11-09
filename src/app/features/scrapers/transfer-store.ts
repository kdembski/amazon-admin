import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { withChart } from '@app/shared/charts/chart-store';
import { ScraperCountSeries } from '@app/types/api-dtos';
import { CountryTransfer } from '@app/types/scrapers';
import { Granularity, TimeRange } from '@app/types/time-range';
import { loadCountSeries } from './load-count-series';
import { directMegabytes, proxyMegabytes } from './scraper-count-metrics';
import { toCountSeries } from './scraper-count-series';

const toCountryTransfer = (
  countries: ScraperCountSeries[],
  range: TimeRange,
  unit: Granularity,
): CountryTransfer[] => {
  return countries.map((country) => ({
    country: country.group,
    series: toCountSeries([country], range, unit, {
      proxy: proxyMegabytes,
      direct: directMegabytes,
    }),
  }));
};

export const TransferStore = signalStore(
  withChart(loadCountSeries, (dto, range, unit) => toCountryTransfer(dto.country, range, unit)),
  withState({ hiddenCountries: [] as string[] }),
  withComputed(({ data, hiddenCountries }) => {
    const countries = computed(() => data()?.series.map(({ country }) => country) ?? []);
    const isHidden = (country: string) => hiddenCountries().includes(country);

    return {
      countries,
      visibleCountries: computed(() => countries().filter((country) => !isHidden(country))),
      chart: computed(() => {
        const loaded = data();
        const withHidden = ({ country, series }: CountryTransfer) => {
          return series.map((line) => ({ ...line, hidden: isHidden(country) }));
        };

        return loaded && { unit: loaded.unit, series: loaded.series.flatMap(withHidden) };
      }),
    };
  }),
  withMethods((store) => ({
    setVisibleCountries: (visible: string[]) => {
      patchState(store, {
        hiddenCountries: store.countries().filter((country) => !visible.includes(country)),
      });
    },
  })),
);
