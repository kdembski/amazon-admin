export interface TimeRange {
  from: Date;
  to: Date;
}

export type RangePreset = '24h' | '7d' | '30d';

export type RangeSelection = { preset: RangePreset } | TimeRange;

export type Granularity = 'hour' | 'day';
