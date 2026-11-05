import { Granularity } from './time-range';

export interface ChartPoint {
  t: Date;
  value: number;
}

export interface ChartSeries {
  label: string;
  points: ChartPoint[];
}

export interface ChartData {
  series: ChartSeries[];
  unit: Granularity;
}
