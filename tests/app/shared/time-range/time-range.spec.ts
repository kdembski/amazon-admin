import { granularity, RANGE_PRESETS, resolveRange } from '@app/shared/time-range/time-range';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const from = new Date('2026-10-01T00:00:00.000Z');

describe('RANGE_PRESETS', () => {
  it('lists 1d, 7d and 30d', () => {
    expect(RANGE_PRESETS).toEqual(['1d', '7d', '30d']);
  });
});

describe('resolveRange', () => {
  const now = new Date('2026-10-26T15:20:00.000Z');

  it.each([
    ['1d', DAY],
    ['7d', 7 * DAY],
    ['30d', 30 * DAY],
  ] as const)('ends the preset %s now', (preset, length) => {
    expect(resolveRange(preset, now)).toEqual({
      from: new Date(now.getTime() - length),
      to: now,
    });
  });
});

describe('granularity', () => {
  it('uses hours up to 48 h and days above', () => {
    expect(granularity({ from, to: new Date(from.getTime() + 48 * HOUR) })).toBe('hour');
    expect(granularity({ from, to: new Date(from.getTime() + 48 * HOUR + 1) })).toBe('day');
  });
});
