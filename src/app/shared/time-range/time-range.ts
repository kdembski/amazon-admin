import { Granularity, RangePreset, RangeSelection, TimeRange } from '@app/types/time-range';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const MAX_RANGE_MS = 30 * DAY;

const PRESET_LENGTHS: Record<RangePreset, number> = { '24h': DAY, '7d': 7 * DAY, '30d': 30 * DAY };

const DEFAULT_SELECTION: RangeSelection = { preset: '24h' };

export const parseRange = (value: string | null): RangeSelection => {
  if (value && Object.hasOwn(PRESET_LENGTHS, value)) {
    return { preset: value as RangePreset };
  }

  const [from, to] = (value ?? '').split('_').map((part) => new Date(part));

  return from && to && isValidRange({ from, to }) ? { from, to } : DEFAULT_SELECTION;
};

export const formatRange = (selection: RangeSelection) => {
  return 'preset' in selection
    ? selection.preset
    : `${selection.from.toISOString()}_${selection.to.toISOString()}`;
};

export const resolveRange = (selection: RangeSelection, now = new Date()): TimeRange => {
  return 'preset' in selection
    ? { from: new Date(now.getTime() - PRESET_LENGTHS[selection.preset]), to: now }
    : selection;
};

export const isValidRange = ({ from, to }: TimeRange) => {
  const length = to.getTime() - from.getTime();

  return length > 0 && length <= MAX_RANGE_MS;
};

export const granularity = ({ from, to }: TimeRange): Granularity => {
  return to.getTime() - from.getTime() <= 48 * HOUR ? 'hour' : 'day';
};
