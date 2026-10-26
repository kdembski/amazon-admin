import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { poll } from '@app/shared/polling/poll';
import { PollState } from '@app/types/poll-state';

class FakeDocument extends EventTarget {
  hidden = false;

  setHidden(hidden: boolean) {
    this.hidden = hidden;
    this.dispatchEvent(new Event('visibilitychange'));
  }
}

const start = new Date('2026-10-26T10:00:00Z');

const run = <T>(load: () => Observable<T>, doc = new FakeDocument()) => {
  const states: PollState<T>[] = [];
  const subscription = poll(load, 1000, doc as unknown as Document).subscribe((s) =>
    states.push(s),
  );
  return { states, doc, subscription, last: () => states[states.length - 1] };
};

describe('poll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => vi.useRealTimers());

  it('starts loading at once and stores the data', () => {
    const results = new Subject<number>();
    const { states, last } = run(() => results);

    expect(states[0]).toEqual({ data: null, error: null, staleSince: null, loading: true });
    results.next(1);
    expect(last()).toEqual({ data: 1, error: null, staleSince: null, loading: false });
  });

  it('reloads every interval', () => {
    let calls = 0;
    const { last } = run(() => of(++calls));

    vi.advanceTimersByTime(2000);

    expect(calls).toBe(3);
    expect(last().data).toBe(3);
  });

  it('keeps the data after a failure and marks it stale since the first failure', () => {
    const answers: Observable<number>[] = [
      of(1),
      throwError(() => new Error('down')),
      throwError(() => new Error('still down')),
      of(2),
    ];
    const { last } = run(() => answers.shift()!);

    vi.advanceTimersByTime(1000);
    expect(last()).toEqual({
      data: 1,
      error: 'Error: down',
      staleSince: new Date(start.getTime() + 1000),
      loading: false,
    });

    vi.advanceTimersByTime(1000);
    expect(last()).toMatchObject({
      data: 1,
      error: 'Error: still down',
      staleSince: new Date(start.getTime() + 1000),
    });

    vi.advanceTimersByTime(1000);
    expect(last()).toEqual({ data: 2, error: null, staleSince: null, loading: false });
  });

  it('reports a failure before any data without a stale mark', () => {
    const error = new HttpErrorResponse({
      status: 503,
      statusText: 'Service Unavailable',
      error: "Can't reach database server",
    });
    const { last } = run(() => throwError(() => error));

    expect(last()).toEqual({
      data: null,
      error: "503 Can't reach database server",
      staleSince: null,
      loading: false,
    });
  });

  it('uses the status text when the error has no body', () => {
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const { last } = run(() => throwError(() => error));

    expect(last().error).toBe('401 Unauthorized');
  });

  it('does not load while the tab is hidden and loads once it is visible again', () => {
    let calls = 0;
    const doc = new FakeDocument();
    doc.hidden = true;
    run(() => of(++calls), doc);

    vi.advanceTimersByTime(3000);
    expect(calls).toBe(0);

    doc.setHidden(false);
    expect(calls).toBe(1);
  });

  it('stops polling on unsubscribe', () => {
    let calls = 0;
    const { subscription } = run(() => of(++calls));

    subscription.unsubscribe();
    vi.advanceTimersByTime(5000);

    expect(calls).toBe(1);
  });
});
