import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signalStore } from '@ngrx/signals';
import { Observable, of, Subject } from 'rxjs';
import { withPolling } from '@app/shared/polling/with-polling';
import { TimeRangeStore } from '@app/shared/time-range/time-range-store';
import { TimeRange } from '@app/types/time-range';

@Component({ template: '' })
class Blank {}

const DAY = 86_400_000;
const start = new Date('2026-10-26T10:00:00.000Z');

const setup = (load: (range: TimeRange) => Observable<number>) => {
  const TestStore = signalStore(withPolling(() => load, 1000));
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: '**', component: Blank }]), TestStore],
  });
  const store = TestBed.inject(TestStore);
  TestBed.tick();
  return { store, timeRange: TestBed.inject(TimeRangeStore) };
};

describe('withPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => vi.useRealTimers());

  it('loads the resolved range at once and stores the data', () => {
    const load = vi.fn<(range: TimeRange) => Observable<number>>(() => of(1));
    const { store } = setup(load);

    expect(load).toHaveBeenCalledWith({ from: new Date(start.getTime() - DAY), to: start });
    expect(store.data()).toBe(1);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.staleSince()).toBeNull();
  });

  it('reloads every interval with a fresh range', () => {
    let calls = 0;
    const load = vi.fn<(range: TimeRange) => Observable<number>>(() => of(++calls));
    const { store } = setup(load);

    vi.advanceTimersByTime(1000);

    expect(store.data()).toBe(2);
    expect(load.mock.calls[1][0].to).toEqual(new Date(start.getTime() + 1000));
  });

  it('restarts with no data after the range changes', async () => {
    const pending = new Subject<number>();
    const answers: Observable<number>[] = [of(1), pending];
    const load = vi.fn<(range: TimeRange) => Observable<number>>(() => answers.shift()!);
    const { store, timeRange } = setup(load);

    await timeRange.select({ preset: '7d' });
    TestBed.tick();

    expect(load).toHaveBeenCalledTimes(2);
    expect(load.mock.calls[1][0].from).toEqual(new Date(start.getTime() - 7 * DAY));
    expect(store.data()).toBeNull();
    expect(store.loading()).toBe(true);
    pending.next(7);
    expect(store.data()).toBe(7);
  });
});
