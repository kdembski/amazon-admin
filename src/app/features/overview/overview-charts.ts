import { toChartPoints } from '@app/shared/charts/to-chart-points';
import { ActivityEventType, ActivityStatsDto } from '@app/types/api-dtos';
import { ChartSeries } from '@app/types/chart';
import { Granularity, TimeRange } from '@app/types/time-range';

const pointsOf = (dto: ActivityStatsDto, type: ActivityEventType) => {
  return dto.series.find((series) => series.type === type)?.points ?? [];
};

export const channelName = (dto: ActivityStatsDto, channel: string | null) => {
  return dto.countryOutlierChannels.find(({ id }) => id === channel)?.name ?? `#${channel}`;
};

export const outliersByChannel = (dto: ActivityStatsDto) => {
  return dto.series
    .filter((series) => series.type === 'country_outlier_sent')
    .sort((a, b) => (a.channel ?? '').localeCompare(b.channel ?? '', undefined, { numeric: true }));
};

export const toScrapedSeries = (
  dto: ActivityStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  return [
    { label: 'Scraped ads', points: toChartPoints(pointsOf(dto, 'ad_scraped'), range, unit) },
  ];
};

export const toAnomalySeries = (
  dto: ActivityStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  const outliers = outliersByChannel(dto).map((series) => ({
    label: `Country outlier ${channelName(dto, series.channel)}`,
    points: toChartPoints(series.points, range, unit),
  }));
  const drops = dto.series
    .filter((series) => series.type === 'price_drop_sent')
    .map((series) => ({ label: 'Price drop', points: toChartPoints(series.points, range, unit) }));

  return [...outliers, ...drops];
};

export const toAdChangeSeries = (
  dto: ActivityStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  return [
    { label: 'New ads', points: toChartPoints(pointsOf(dto, 'ad_created'), range, unit) },
    { label: 'Deleted ads', points: toChartPoints(pointsOf(dto, 'ad_deleted'), range, unit) },
  ];
};
