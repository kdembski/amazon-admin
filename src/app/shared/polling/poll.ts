import { HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  exhaustMap,
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  of,
  scan,
  startWith,
  timer,
} from 'rxjs';
import { PollEvent, PollState } from '@app/types/poll-state';

export const poll = <T>(
  load: () => Observable<T>,
  intervalMs = 60_000,
  doc: Document = document,
): Observable<PollState<T>> => {
  const visible = fromEvent(doc, 'visibilitychange').pipe(filter(() => !doc.hidden));

  return merge(timer(intervalMs, intervalMs).pipe(startWith(0)), visible).pipe(
    filter(() => !doc.hidden),
    exhaustMap(() =>
      load().pipe(
        map((data): PollEvent<T> => ({ type: 'data', data })),
        catchError((error: unknown) =>
          of<PollEvent<T>>({ type: 'error', error: errorText(error) }),
        ),
        startWith<PollEvent<T>>({ type: 'start' }),
      ),
    ),
    scan(reduce<T>, initialPollState<T>()),
  );
};

export const initialPollState = <T>(): PollState<T> => ({
  data: null,
  error: null,
  staleSince: null,
  loading: false,
});

const reduce = <T>(state: PollState<T>, event: PollEvent<T>): PollState<T> => {
  switch (event.type) {
    case 'start':
      return { ...state, loading: true };
    case 'data':
      return { data: event.data, error: null, staleSince: null, loading: false };
    case 'error':
      return {
        ...state,
        error: event.error,
        staleSince: state.data === null ? null : (state.staleSince ?? new Date()),
        loading: false,
      };
  }
};

const errorText = (error: unknown) => {
  if (error instanceof HttpErrorResponse) {
    const body = typeof error.error === 'string' && error.error ? error.error : error.statusText;
    return `${error.status} ${body}`;
  }
  return String(error);
};
