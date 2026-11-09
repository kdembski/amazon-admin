import {
  channelName,
  outliersByChannel,
  pointsOf,
  seriesOf,
} from '@app/features/overview/activity-series';
import { ActivityStatsDto } from '@app/types/api-dtos';
import { activity } from './store-fixtures';

const point = { t: '2026-10-26T10:00:00.000Z', value: 1 };

const dto: ActivityStatsDto = {
  ...activity,
  series: [
    { type: 'country_outlier_sent', channel: '10', points: [point] },
    { type: 'country_outlier_sent', channel: '9', points: [] },
    { type: 'price_drop_sent', channel: null, points: [point] },
  ],
  countryOutlierChannels: [{ id: '9', name: 'outliers-de' }],
};

describe('pointsOf', () => {
  it('returns the points of the first series of the type', () => {
    expect(pointsOf(dto, 'price_drop_sent')).toEqual([point]);
  });

  it('returns no points without such a series', () => {
    expect(pointsOf(dto, 'ad_created')).toEqual([]);
  });
});

describe('seriesOf', () => {
  it('returns every series of the type', () => {
    expect(seriesOf(dto, 'country_outlier_sent')).toHaveLength(2);
  });
});

describe('channelName', () => {
  it('names a known channel', () => {
    expect(channelName(dto, '9')).toBe('outliers-de');
  });

  it('falls back to the channel id', () => {
    expect(channelName(dto, '10')).toBe('#10');
  });
});

describe('outliersByChannel', () => {
  it('sorts the outlier series by numeric channel', () => {
    expect(outliersByChannel(dto).map((series) => series.channel)).toEqual(['9', '10']);
  });
});
