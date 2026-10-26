import { toChartPoints } from '@app/shared/charts/to-chart-points';
import { ActivityStatsDto, LogStatsDto } from '@app/types/api-dtos';
import { ChartSeries } from '@app/types/chart';
import { Tile } from '@app/types/overview';
import { Granularity, TimeRange } from '@app/types/time-range';

const LOG_LABELS = { error: 'Błędy', warn: 'Ostrzeżenia' };

export const toScrapedSeries = (
  dto: ActivityStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  const scraped = dto.series.find((series) => series.type === 'ad_scraped');

  return [
    { label: 'Zebrane ogłoszenia', points: toChartPoints(scraped?.points ?? [], range, unit) },
  ];
};

export const toAnomalySeries = (
  dto: ActivityStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  const outliers = dto.series
    .filter((series) => series.type === 'country_outlier_sent')
    .sort((a, b) => (a.channel ?? '').localeCompare(b.channel ?? '', undefined, { numeric: true }))
    .map((series) => ({ label: `Country outlier ${series.channel}`, points: series.points }));
  const drops = dto.series
    .filter((series) => series.type === 'price_drop_sent')
    .map((series) => ({ label: 'Price drop', points: series.points }));

  return [...outliers, ...drops].map((series) => ({
    label: series.label,
    points: toChartPoints(series.points, range, unit),
  }));
};

export const toLogSeries = (
  dto: LogStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  return dto.series.map((series) => ({
    label: LOG_LABELS[series.level],
    points: toChartPoints(series.points, range, unit),
  }));
};

export const toTiles = (activity: ActivityStatsDto, logs: LogStatsDto): Tile[] => {
  const tile = (label: string, value: number, previous: number) => ({ label, value, previous });

  return [
    tile('Zebrane ogłoszenia', activity.totals.ad_scraped, activity.previousTotals.ad_scraped),
    tile(
      'Country outliers',
      activity.totals.country_outlier_sent,
      activity.previousTotals.country_outlier_sent,
    ),
    tile('Price drops', activity.totals.price_drop_sent, activity.previousTotals.price_drop_sent),
    tile(LOG_LABELS.error, logs.totals.error, logs.previousTotals.error),
    tile(LOG_LABELS.warn, logs.totals.warn, logs.previousTotals.warn),
  ];
};
