import { Granularity, RangePreset, TimeRange } from '@app/types/time-range';

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const PRESET_LENGTHS: Record<RangePreset, number> = { '1d': DAY, '7d': 7 * DAY, '30d': 30 * DAY };

export const RANGE_PRESETS = Object.keys(PRESET_LENGTHS) as RangePreset[];

export const floorToHour = (date: Date) => new Date(Math.floor(date.getTime() / HOUR) * HOUR);

export const resolveRange = (preset: RangePreset, now = new Date()): TimeRange => {
  return { from: new Date(now.getTime() - PRESET_LENGTHS[preset]), to: now };
};

export const granularity = ({ from, to }: TimeRange): Granularity => {
  return to.getTime() - from.getTime() <= 2 * DAY ? 'hour' : 'day';
};
