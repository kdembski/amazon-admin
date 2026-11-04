import { firstValueFrom, of } from 'rxjs';
import { loadLastHourAndDay, stat } from '@app/shared/summary/summary';
import { TimeRange } from '@app/types/time-range';

describe('stat', () => {
  it('rounds the percent change against the previous value', () => {
    expect(stat('a', 15, 10)).toEqual({ label: 'a', value: 15, change: 50 });
    expect(stat('a', 1, 3)).toEqual({ label: 'a', value: 1, change: -67 });
  });

  it('has no change without a previous value', () => {
    expect(stat('a', 5, 0).change).toBeNull();
    expect(stat('a', 5, null).change).toBeNull();
  });
});

describe('loadLastHourAndDay', () => {
  const now = new Date('2026-10-26T10:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => vi.useRealTimers());

  it('loads the tiles of the last hour and the last 24 h as two periods', async () => {
    const tiles = vi.fn((range: TimeRange) => {
      const hours = (range.to.getTime() - range.from.getTime()) / 3_600_000;

      return of([{ label: `${hours} h`, value: hours, change: null, details: [] }]);
    });

    const periods = await firstValueFrom(loadLastHourAndDay(tiles));

    expect(tiles).toHaveBeenCalledWith({ from: new Date('2026-10-26T09:00:00.000Z'), to: now });
    expect(tiles).toHaveBeenCalledWith({ from: new Date('2026-10-25T10:00:00.000Z'), to: now });
    expect(periods.map((period) => [period.name, period.tiles[0].label])).toEqual([
      ['Ostatnia godzina', '1 h'],
      ['Ostatnie 24 h', '24 h'],
    ]);
  });
});
