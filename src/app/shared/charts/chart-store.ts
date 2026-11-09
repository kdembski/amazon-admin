import { signalStore } from '@ngrx/signals';
import { map, Observable } from 'rxjs';
import { withPolling } from '@app/shared/polling/with-polling';
import { floorToHour, granularity } from '@app/shared/time-range/time-range';
import { ChartData, ChartSeries } from '@app/types/chart';
import { Granularity, TimeRange } from '@app/types/time-range';

const endAtLastFullHour = ({ from, to }: TimeRange): TimeRange => {
  const end = floorToHour(to);

  return { from: new Date(end.getTime() - (to.getTime() - from.getTime())), to: end };
};

export const withChart = <T, S = ChartSeries[]>(
  createLoad: () => (range: TimeRange) => Observable<T>,
  toSeries: (dto: T, range: TimeRange, unit: Granularity) => S,
) => {
  return withPolling(() => {
    const load = createLoad();

    return (resolved: TimeRange) => {
      const range = endAtLastFullHour(resolved);
      const unit = granularity(range);

      return load(range).pipe(
        map((dto): ChartData<S> => ({ unit, series: toSeries(dto, range, unit) })),
      );
    };
  });
};

export const chartStore = <T>(
  createLoad: () => (range: TimeRange) => Observable<T>,
  toSeries: (dto: T, range: TimeRange, unit: Granularity) => ChartSeries[],
) => {
  return signalStore(withChart(createLoad, toSeries));
};
