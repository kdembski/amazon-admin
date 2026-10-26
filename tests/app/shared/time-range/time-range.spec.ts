import {
  formatRange,
  granularity,
  parseRange,
  resolveRange,
} from '@app/shared/time-range/time-range';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const from = new Date('2026-10-01T00:00:00.000Z');
const iso = (offset: number) => new Date(from.getTime() + offset).toISOString();

describe('parseRange', () => {
  it.each(['24h', '7d', '30d'] as const)('reads the preset %s', (preset) => {
    expect(parseRange(preset)).toEqual({ preset });
  });

  it('reads a custom range of at most 30 days', () => {
    expect(parseRange(`${iso(0)}_${iso(30 * DAY)}`)).toEqual({
      from,
      to: new Date(from.getTime() + 30 * DAY),
    });
  });

  it.each([
    ['no value', null],
    ['garbage', 'yesterday'],
    ['an invalid date', `abc_${iso(0)}`],
    ['a reversed range', `${iso(DAY)}_${iso(0)}`],
    ['an empty range', `${iso(0)}_${iso(0)}`],
    ['more than 30 days', `${iso(0)}_${iso(30 * DAY + 1)}`],
  ])('falls back to 24h for %s', (_, value) => {
    expect(parseRange(value)).toEqual({ preset: '24h' });
  });
});

describe('formatRange', () => {
  it.each(['7d', `${iso(0)}_${iso(DAY)}`])('round-trips %s through parseRange', (value) => {
    expect(formatRange(parseRange(value))).toBe(value);
  });
});

describe('resolveRange', () => {
  const now = new Date('2026-10-26T15:20:00.000Z');

  it.each([
    ['24h', DAY],
    ['7d', 7 * DAY],
    ['30d', 30 * DAY],
  ] as const)('ends the preset %s now', (preset, length) => {
    expect(resolveRange({ preset }, now)).toEqual({
      from: new Date(now.getTime() - length),
      to: now,
    });
  });

  it('keeps a custom range', () => {
    const range = { from, to: new Date(from.getTime() + DAY) };

    expect(resolveRange(range, now)).toEqual(range);
  });
});

describe('granularity', () => {
  it('uses hours up to 48 h and days above', () => {
    expect(granularity({ from, to: new Date(from.getTime() + 48 * HOUR) })).toBe('hour');
    expect(granularity({ from, to: new Date(from.getTime() + 48 * HOUR + 1) })).toBe('day');
  });
});
