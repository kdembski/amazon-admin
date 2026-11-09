import { ActivityEventType, ActivityStatsDto } from '@app/types/api-dtos';

export const pointsOf = (dto: ActivityStatsDto, type: ActivityEventType) => {
  return dto.series.find((series) => series.type === type)?.points ?? [];
};

export const seriesOf = (dto: ActivityStatsDto, type: ActivityEventType) => {
  return dto.series.filter((series) => series.type === type);
};

export const channelName = (dto: ActivityStatsDto, channel: string | null) => {
  return dto.countryOutlierChannels.find(({ id }) => id === channel)?.name ?? `#${channel}`;
};

export const outliersByChannel = (dto: ActivityStatsDto) => {
  return seriesOf(dto, 'country_outlier_sent').sort((a, b) =>
    (a.channel ?? '').localeCompare(b.channel ?? '', undefined, { numeric: true }),
  );
};
