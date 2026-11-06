import { Signal } from '@angular/core';
import { Granularity } from './time-range';

export interface ChartPoint {
  t: Date;
  value: number;
}

export interface ChartSeries {
  label: string;
  points: ChartPoint[];
}

// S is a map of series lists when one chart can switch between them, e.g. per scraper or country.
export interface ChartData<S = ChartSeries[]> {
  series: S;
  unit: Granularity;
}

// What a chart that switches between groupings needs from its store.
export interface GroupedChartSource<G extends string> {
  group: Signal<G>;
  setGroup: (group: G) => void;
}
