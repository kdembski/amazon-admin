import { inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { filter } from 'rxjs';
import { RangeSelection } from '@app/types/time-range';
import { formatRange, parseRange, resolveRange } from './time-range';

const RANGE_PARAM = 'range';

export const TimeRangeStore = signalStore(
  { providedIn: 'root' },
  withState<{ selection: RangeSelection }>({ selection: { preset: '24h' } }),
  withMethods((store, router = inject(Router)) => ({
    select: (selection: RangeSelection) => {
      const url = router.parseUrl(router.url);
      url.queryParams = { ...url.queryParams, [RANGE_PARAM]: formatRange(selection) };
      return router.navigateByUrl(url);
    },
    resolve: () => resolveRange(store.selection()),
  })),
  withHooks((store, router = inject(Router)) => {
    const follow = () => {
      const selection = parseRange(router.parseUrl(router.url).queryParamMap.get(RANGE_PARAM));
      // A new object would restart every poll even when the range stayed the same.
      if (formatRange(selection) !== formatRange(store.selection())) {
        patchState(store, { selection });
      }
    };
    return {
      onInit: () => {
        follow();
        router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(follow);
      },
    };
  }),
);
