export interface SummaryStat {
  label: string;
  value: number;
  // Percent change against the previous period of the same length; null when that was 0.
  change: number | null;
}

export interface SummaryTile extends SummaryStat {
  // Decimal places of the tile and its details; 0 when absent.
  digits?: number;
  // A breakdown of the tile, e.g. one stat per country outlier channel.
  details: SummaryStat[];
}

export interface SummaryPeriod {
  name: string;
  tiles: SummaryTile[];
}
