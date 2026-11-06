export interface SummaryStat {
  label: string;
  value: number;
  // Percent change against the previous period of the same length; null when that was 0.
  change: number | null;
  // Percent of the whole tile, for a breakdown whose parts add up to it.
  share?: number;
}

export interface SummaryTile extends SummaryStat {
  // Decimal places of the tile and its details; 0 when absent.
  digits?: number;
  // 0 = left, 1 = right; tiles without it alternate between the columns.
  column?: 0 | 1;
  // A breakdown of the tile, e.g. one stat per country outlier channel.
  details: SummaryStat[];
}

export interface SummaryPeriod {
  name: string;
  tiles: SummaryTile[];
}
