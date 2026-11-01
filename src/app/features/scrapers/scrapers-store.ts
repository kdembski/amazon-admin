import { computed, inject } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';
import { forkJoin, map } from 'rxjs';
import { ScrapersApiService } from '@app/core/api/scrapers-api-service';
import { withPolling } from '@app/shared/polling/with-polling';
import { granularity } from '@app/shared/time-range/time-range';
import { ScraperChartField, ScrapersData } from '@app/types/scrapers';
import { TimeRange } from '@app/types/time-range';
import { toScraperSeries } from './scraper-charts';

export const ScrapersStore = signalStore(
  withPolling(() => {
    const api = inject(ScrapersApiService);

    // The range travels with the data so the charts span exactly what was loaded.
    return (range: TimeRange) => {
      return forkJoin({ summaries: api.getSummaries(range), series: api.getSeries(range) }).pipe(
        map((loaded): ScrapersData => ({ ...loaded, range })),
      );
    };
  }),
  withComputed(({ data }) => {
    const unit = computed(() => {
      const loaded = data();

      return loaded ? granularity(loaded.range) : 'hour';
    });
    const chart = (field: ScraperChartField) => {
      return computed(() => {
        const loaded = data();

        return loaded ? toScraperSeries(loaded.series, loaded.range, unit(), field) : [];
      });
    };

    return {
      unit,
      rows: computed(() => data()?.summaries ?? []),
      itemsSeries: chart('itemsPerSecond'),
      wastedSeries: chart('wastedPercent'),
      captchaSeries: chart('captchaPercent'),
    };
  }),
);
