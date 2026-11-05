import { Granularity, RangePreset, TimeRange } from '@app/types/time-range';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const PRESET_LENGTHS: Record<RangePreset, number> = { '1d': DAY, '7d': 7 * DAY, '30d': 30 * DAY };

export const RANGE_PRESETS = Object.keys(PRESET_LENGTHS) as RangePreset[];

export const resolveRange = (preset: RangePreset, now = new Date()): TimeRange => {
  return { from: new Date(now.getTime() - PRESET_LENGTHS[preset]), to: now };
};

export const granularity = ({ from, to }: TimeRange): Granularity => {
  return to.getTime() - from.getTime() <= 48 * HOUR ? 'hour' : 'day';
};
