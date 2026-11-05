export interface TimeRange {
  from: Date;
  to: Date;
}

export type RangePreset = '1d' | '7d' | '30d';

export type Granularity = 'hour' | 'day';
