import { forkJoin, map, Observable } from 'rxjs';
import { SummaryPeriod, SummaryStat, SummaryTile } from '@app/types/summary';
import { TimeRange } from '@app/types/time-range';

const HOUR = 3_600_000;

export const stat = (label: string, value: number, previous: number | null): SummaryStat => {
  return {
    label,
    value,
    change: previous ? Math.round(((value - previous) / previous) * 100) : null,
  };
};

// The summary ignores the selected range; a range change only reloads it early.
export const loadLastHourAndDay = (
  tiles: (range: TimeRange) => Observable<SummaryTile[]>,
): Observable<SummaryPeriod[]> => {
  const to = new Date();

  return forkJoin([
    tiles({ from: new Date(to.getTime() - HOUR), to }),
    tiles({ from: new Date(to.getTime() - 24 * HOUR), to }),
  ]).pipe(
    map(([hour, day]) => [
      { name: 'Ostatnia godzina', tiles: hour },
      { name: 'Ostatnie 24 h', tiles: day },
    ]),
  );
};
