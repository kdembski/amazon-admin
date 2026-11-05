import { toChartPoints } from '@app/shared/charts/to-chart-points';
import { ActivityEventType, ActivityStatsDto, LogStatsDto } from '@app/types/api-dtos';
import { stat } from '@app/shared/summary/summary';
import { ChartSeries } from '@app/types/chart';
import { SummaryStat, SummaryTile } from '@app/types/summary';
import { Granularity, TimeRange } from '@app/types/time-range';

const LOG_LABELS = { error: 'Errors', warn: 'Warnings' };

export const toScrapedSeries = (
  dto: ActivityStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  const scraped = dto.series.find((series) => series.type === 'ad_scraped');

  return [{ label: 'Scraped ads', points: toChartPoints(scraped?.points ?? [], range, unit) }];
};

// A channel no longer in the settings keeps only its id.
const channelName = (dto: ActivityStatsDto, channel: string | null) => {
  return dto.countryOutlierChannels.find(({ id }) => id === channel)?.name ?? `#${channel}`;
};

const outliersByChannel = (dto: ActivityStatsDto) => {
  return dto.series
    .filter((series) => series.type === 'country_outlier_sent')
    .sort((a, b) => (a.channel ?? '').localeCompare(b.channel ?? '', undefined, { numeric: true }));
};

export const toAnomalySeries = (
  dto: ActivityStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  const outliers = outliersByChannel(dto).map((series) => ({
    label: `Country outlier ${channelName(dto, series.channel)}`,
    points: series.points,
  }));
  const drops = dto.series
    .filter((series) => series.type === 'price_drop_sent')
    .map((series) => ({ label: 'Price drop', points: series.points }));

  return [...outliers, ...drops].map((series) => ({
    label: series.label,
    points: toChartPoints(series.points, range, unit),
  }));
};

export const toAdChangeSeries = (
  dto: ActivityStatsDto,
  range: TimeRange,
  unit: Granularity,
): ChartSeries[] => {
  const points = (type: ActivityEventType) => {
    return dto.series.find((series) => series.type === type)?.points ?? [];
  };

  return [
    { label: 'New ads', points: toChartPoints(points('ad_created'), range, unit) },
    { label: 'Deleted ads', points: toChartPoints(points('ad_deleted'), range, unit) },
  ];
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

export const toSummaryTiles = (dto: ActivityStatsDto): SummaryTile[] => {
  const { totals, previousTotals, comparable } = dto;
  const tile = (label: string, type: ActivityEventType, details: SummaryStat[] = []) => {
    return { ...stat(label, totals[type], previousTotals[type]), details };
  };
  const outliers = outliersByChannel(dto);
  // Channels of the settings first, in their order, so the ones without outliers show 0.
  const channels = [
    ...new Set([
      ...dto.countryOutlierChannels.map(({ id }) => id),
      ...outliers.map((series) => series.channel ?? ''),
    ]),
  ];
  // The API has no previous totals per channel, so channels show no change.
  const sent = (channel: string) => {
    const points = outliers.find((series) => series.channel === channel)?.points ?? [];

    return stat(
      channelName(dto, channel),
      points.reduce((sum, point) => sum + point.value, 0),
      null,
    );
  };

  return [
    tile(
      'Scraped ads',
      'ad_scraped',
      comparable
        ? [stat(`${comparable.minPrices}+ prices`, comparable.total, comparable.previousTotal)]
        : [],
    ),
    tile('Country outliers', 'country_outlier_sent', channels.map(sent)),
    // A change of a balance that can cross 0 means nothing, so only its parts show one.
    {
      ...stat('Ad balance', totals.ad_created - totals.ad_deleted, null),
      details: [
        stat('New ads', totals.ad_created, previousTotals.ad_created),
        stat('Deleted ads', totals.ad_deleted, previousTotals.ad_deleted),
      ],
    },
    tile('Price drops', 'price_drop_sent'),
  ];
};
