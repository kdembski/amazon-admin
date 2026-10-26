export interface ChartPoint {
  t: Date;
  value: number;
}

export interface ChartSeries {
  label: string;
  points: ChartPoint[];
}
