import { toChartPoints } from '@app/shared/charts/to-chart-points';
import { ActivityStatsDto, TimePoint } from '@app/types/api-dtos';
import { ChartSeries } from '@app/types/chart';
import { Granularity, TimeRange } from '@app/types/time-range';
import { channelName, outliersByChannel, pointsOf, seriesOf } from './activity-series';

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
  const line = (label: string, points: TimePoint[]) => {
    return { label, points: toChartPoints(points, range, unit) };
  };
  const outliers = outliersByChannel(dto).map((series) => {
    return line(`Country outlier ${channelName(dto, series.channel)}`, series.points);
  });
  const drops = seriesOf(dto, 'price_drop_sent').map((series) => line('Price drop', series.points));

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
