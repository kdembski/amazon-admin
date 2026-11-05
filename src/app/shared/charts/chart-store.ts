import { signalStore } from '@ngrx/signals';
import { map, Observable } from 'rxjs';
import { withPolling } from '@app/shared/polling/with-polling';
import { granularity } from '@app/shared/time-range/time-range';
import { ChartData, ChartSeries } from '@app/types/chart';
import { Granularity, TimeRange } from '@app/types/time-range';

const HOUR = 3_600_000;

// A store of one chart: loads its own range and turns the response into series.
export const chartStore = <T>(
  createLoad: () => (range: TimeRange) => Observable<T>,
  toSeries: (dto: T, range: TimeRange, unit: Granularity) => ChartSeries[],
) => {
  return signalStore(
    withPolling(() => {
      const load = createLoad();

      return (resolved: TimeRange) => {
        // The hour still being collected would show as a dip, so the chart ends at the last full one.
        const to = new Date(Math.floor(resolved.to.getTime() / HOUR) * HOUR);
        const range = {
          from: new Date(to.getTime() - (resolved.to.getTime() - resolved.from.getTime())),
          to,
        };
        const unit = granularity(range);

        return load(range).pipe(
          map((dto): ChartData => ({ unit, series: toSeries(dto, range, unit) })),
        );
      };
    }),
  );
};
