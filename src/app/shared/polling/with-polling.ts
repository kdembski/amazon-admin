import { inject } from '@angular/core';
import { patchState, signalStoreFeature, withHooks, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { TimeRangeStore } from '@app/shared/time-range/time-range-store';
import { PollState } from '@app/types/poll-state';
import { RangeSelection, TimeRange } from '@app/types/time-range';
import { initialPollState, poll } from './poll';

// createLoad runs in the injection context, so it can inject the API services the load uses.
export const withPolling = <T>(
  createLoad: () => (range: TimeRange) => Observable<T>,
  intervalMs = 60_000,
) => {
  return signalStoreFeature(
    withState<PollState<T>>(initialPollState<T>()),
    withHooks((store) => {
      const timeRange = inject(TimeRangeStore);
      const load = createLoad();

      const follow = rxMethod<RangeSelection>(
        pipe(
          switchMap(() => poll(() => load(timeRange.resolve()), intervalMs)),
          tap((state) => patchState(store, state)),
        ),
      );

      return { onInit: () => follow(timeRange.selection) };
    }),
  );
};
