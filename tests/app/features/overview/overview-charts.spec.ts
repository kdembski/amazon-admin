import {
  toAnomalySeries,
  toLogSeries,
  toScrapedSeries,
  toTiles,
} from '@app/features/overview/overview-charts';
import { ActivityStatsDto, LogStatsDto } from '@app/types/api-dtos';

const range = {
  from: new Date('2026-10-26T10:00:00.000Z'),
  to: new Date('2026-10-26T13:00:00.000Z'),
};
const hour = (h: number) => new Date(`2026-10-26T${h}:00:00.000Z`);

const activity: ActivityStatsDto = {
  series: [
    { type: 'ad_scraped', channel: null, points: [{ t: hour(11).toISOString(), value: 40 }] },
    {
      type: 'country_outlier_sent',
      channel: '3',
      points: [{ t: hour(10).toISOString(), value: 2 }],
    },
    {
      type: 'country_outlier_sent',
      channel: '1',
      points: [{ t: hour(12).toISOString(), value: 1 }],
    },
    { type: 'price_drop_sent', channel: null, points: [{ t: hour(11).toISOString(), value: 4 }] },
  ],
  totals: { ad_scraped: 40, country_outlier_sent: 3, price_drop_sent: 4 },
  previousTotals: { ad_scraped: 20, country_outlier_sent: 0, price_drop_sent: 8 },
};

const logs: LogStatsDto = {
  series: [
    { level: 'error', points: [{ t: hour(12).toISOString(), value: 2 }] },
    { level: 'warn', points: [] },
  ],
  totals: { error: 2, warn: 0 },
  previousTotals: { error: 1, warn: 5 },
  topSources: [],
};

describe('toScrapedSeries', () => {
  it('fills every hour of the range with zeros', () => {
    expect(toScrapedSeries(activity, range, 'hour')).toEqual([
      {
        label: 'Zebrane ogłoszenia',
        points: [
          { t: hour(10), value: 0 },
          { t: hour(11), value: 40 },
          { t: hour(12), value: 0 },
        ],
      },
    ]);
  });

  it('sums the hours of each local day', () => {
    const [series] = toScrapedSeries(activity, range, 'day');

    expect(series.points).toEqual([{ t: new Date(2026, 9, 26), value: 40 }]);
  });

  it('returns a zero series without scraped ads', () => {
    const [series] = toScrapedSeries({ ...activity, series: [] }, range, 'hour');

    expect(series.points.map((p) => p.value)).toEqual([0, 0, 0]);
  });
});

describe('toAnomalySeries', () => {
  it('returns the country outlier channels in order and the price drops', () => {
    expect(toAnomalySeries(activity, range, 'hour').map((s) => s.label)).toEqual([
      'Country outlier 1',
      'Country outlier 3',
      'Price drop',
    ]);
  });

  it('returns nothing without anomalies', () => {
    expect(toAnomalySeries({ ...activity, series: [activity.series[0]] }, range, 'hour')).toEqual(
      [],
    );
  });
});

describe('toLogSeries', () => {
  it('returns errors and warnings', () => {
    const series = toLogSeries(logs, range, 'hour');

    expect(series.map((s) => s.label)).toEqual(['Błędy', 'Ostrzeżenia']);
    expect(series[0].points.map((p) => p.value)).toEqual([0, 0, 2]);
  });
});

describe('toTiles', () => {
  it('returns the five totals with their previous values', () => {
    expect(toTiles(activity, logs)).toEqual([
      { label: 'Zebrane ogłoszenia', value: 40, previous: 20 },
      { label: 'Country outliers', value: 3, previous: 0 },
      { label: 'Price drops', value: 4, previous: 8 },
      { label: 'Błędy', value: 2, previous: 1 },
      { label: 'Ostrzeżenia', value: 0, previous: 5 },
    ]);
  });
});
