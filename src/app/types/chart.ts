import { Signal } from '@angular/core';
import { RangePanelSource } from './range-panel';
import { Granularity } from './time-range';

export interface ChartPoint {
  t: Date;
  value: number;
}

export interface ChartSeries {
  label: string;
  hidden?: boolean;
  points: ChartPoint[];
}

export interface ChartData<S = ChartSeries[]> {
  series: S;
  unit: Granularity;
}

export interface GroupedChartSource<G extends string> {
  group: Signal<G>;
  setGroup: (group: G) => void;
}

export type ChartType = 'line' | 'bar';

export interface ChartOptionsInput {
  series: ChartSeries[];
  type: ChartType;
  stacked: boolean;
  unit: Granularity;
  pointLabels: boolean;
  text: string;
  grid: string;
}

export interface GroupedChartPanelSource<G extends string>
  extends RangePanelSource, GroupedChartSource<G> {
  chart: Signal<ChartData | null>;
}
