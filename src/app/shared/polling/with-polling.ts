import { patchState, signalStoreFeature, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { MINUTE, resolveRange } from '@app/shared/time-range/time-range';
import { PollState } from '@app/types/poll-state';
import { RangePreset, TimeRange } from '@app/types/time-range';
import { initialPollState, poll } from './poll';

export const withPolling = <T>(
  createLoad: () => (range: TimeRange) => Observable<T>,
  intervalMs = MINUTE,
) => {
  return signalStoreFeature(
    withState<PollState<T> & { preset: RangePreset }>({ ...initialPollState<T>(), preset: '1d' }),
    withMethods((store) => ({
      setPreset: (preset: RangePreset) => patchState(store, { preset }),
    })),
    withHooks((store) => {
      const load = createLoad();

      const follow = rxMethod<RangePreset>(
        pipe(
          switchMap((preset) => poll(() => load(resolveRange(preset)), intervalMs)),
          tap((state) => patchState(store, state)),
        ),
      );

      return { onInit: () => follow(store.preset) };
    }),
  );
};
