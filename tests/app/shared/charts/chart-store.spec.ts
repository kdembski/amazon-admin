import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { chartStore } from '@app/shared/charts/chart-store';
import { Granularity, TimeRange } from '@app/types/time-range';

const start = new Date('2026-10-26T10:00:00.000Z');

describe('chartStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(start);
  });

  afterEach(() => vi.useRealTimers());

  it('turns the response for its own range into series with the unit of that range', () => {
    const toSeries = vi.fn((dto: number, _range: TimeRange, unit: Granularity) => [
      { label: `${dto} per ${unit}`, points: [] },
    ]);
    const TestStore = chartStore(() => () => of(5), toSeries);
    TestBed.configureTestingModule({ providers: [TestStore] });
    const store = TestBed.inject(TestStore);
    TestBed.tick();

    expect(store.data()).toEqual({ unit: 'hour', series: [{ label: '5 per hour', points: [] }] });

    store.setPreset('7d');
    TestBed.tick();

    expect(store.data()?.unit).toBe('day');
    expect(toSeries.mock.calls[1][1].from).toEqual(new Date(start.getTime() - 7 * 86_400_000));
  });

  it('ends at the last full hour', () => {
    vi.setSystemTime(new Date('2026-10-26T10:42:00.000Z'));
    const load = vi.fn<(range: TimeRange) => Observable<number>>(() => of(1));
    const TestStore = chartStore(
      () => load,
      () => [],
    );
    TestBed.configureTestingModule({ providers: [TestStore] });
    TestBed.inject(TestStore);
    TestBed.tick();

    expect(load).toHaveBeenCalledWith({
      from: new Date('2026-10-25T10:00:00.000Z'),
      to: new Date('2026-10-26T10:00:00.000Z'),
    });
  });
});
