import { sumBy } from '@app/shared/math/sum';
import { stat } from '@app/shared/summary/summary';
import { ActivityEventType, ActivityStatsDto } from '@app/types/api-dtos';
import { SummaryStat, SummaryTile } from '@app/types/summary';
import { channelName, outliersByChannel } from './activity-series';

const tile = (
  dto: ActivityStatsDto,
  label: string,
  type: ActivityEventType,
  details: SummaryStat[] = [],
): SummaryTile => {
  return { ...stat(label, dto.totals[type], dto.previousTotals[type]), details };
};

const scrapedTile = (dto: ActivityStatsDto) => {
  const { comparable } = dto;
  const details = comparable
    ? [stat(`${comparable.minPrices}+ prices`, comparable.total, comparable.previousTotal)]
    : [];

  return tile(dto, 'Scraped ads', 'ad_scraped', details);
};

const outliersTile = (dto: ActivityStatsDto) => {
  const outliers = outliersByChannel(dto);
  const channels = new Set([
    ...dto.countryOutlierChannels.map(({ id }) => id),
    ...outliers.map((series) => series.channel ?? ''),
  ]);

  const sent = (channel: string) => {
    const points = outliers.find((series) => series.channel === channel)?.points ?? [];
    return stat(
      channelName(dto, channel),
      sumBy(points, (point) => point.value),
      null,
    );
  };

  return tile(dto, 'Country outliers', 'country_outlier_sent', [...channels].map(sent));
};

const balanceTile = ({ totals, previousTotals }: ActivityStatsDto): SummaryTile => {
  return {
    ...stat('Ad balance', totals.ad_created - totals.ad_deleted, null),
    details: [
      stat('New ads', totals.ad_created, previousTotals.ad_created),
      stat('Deleted ads', totals.ad_deleted, previousTotals.ad_deleted),
    ],
  };
};

export const toSummaryTiles = (dto: ActivityStatsDto): SummaryTile[] => {
  return [
    scrapedTile(dto),
    outliersTile(dto),
    balanceTile(dto),
    tile(dto, 'Price drops', 'price_drop_sent'),
  ];
};
