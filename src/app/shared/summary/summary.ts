import { forkJoin, map, Observable } from 'rxjs';
import { DAY, HOUR } from '@app/shared/time-range/time-range';
import { SummaryPeriod, SummaryStat, SummaryTile } from '@app/types/summary';
import { TimeRange } from '@app/types/time-range';

const lastMs = (length: number, to: Date): TimeRange => {
  return { from: new Date(to.getTime() - length), to };
};

export const stat = (label: string, value: number, previous: number | null): SummaryStat => {
  return {
    label,
    value,
    change: previous ? Math.round(((value - previous) / previous) * 100) : null,
  };
};

export const loadLastHourAndDay = (
  tiles: (range: TimeRange) => Observable<SummaryTile[]>,
): Observable<SummaryPeriod[]> => {
  const to = new Date();

  return forkJoin([tiles(lastMs(HOUR, to)), tiles(lastMs(DAY, to))]).pipe(
    map(([hour, day]) => [
      { name: 'Last hour', tiles: hour },
      { name: 'Last 24 h', tiles: day },
    ]),
  );
};
