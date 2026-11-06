import {
  toAdChangeSeries,
  toAnomalySeries,
  toScrapedSeries,
  toSummaryTiles,
} from '@app/features/overview/overview-charts';
import { ActivityStatsDto } from '@app/types/api-dtos';

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
  totals: {
    ad_scraped: 40,
    country_outlier_sent: 3,
    price_drop_sent: 4,
    ad_created: 6,
    ad_deleted: 2,
  },
  previousTotals: {
    ad_scraped: 20,
    country_outlier_sent: 0,
    price_drop_sent: 8,
    ad_created: 3,
    ad_deleted: 0,
  },
  comparable: { minPrices: 3, total: 10, previousTotal: 5 },
  countryOutlierChannels: [{ id: '1', name: 'outliers-de' }],
};

describe('toScrapedSeries', () => {
  it('fills every hour of the range with zeros', () => {
    expect(toScrapedSeries(activity, range, 'hour')).toEqual([
      {
        label: 'Scraped ads',
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
  it('returns the country outlier channels in order by name, or id without one, and the price drops', () => {
    expect(toAnomalySeries(activity, range, 'hour').map((s) => s.label)).toEqual([
      'Country outlier outliers-de',
      'Country outlier #3',
      'Price drop',
    ]);
  });

  it('returns nothing without anomalies', () => {
    expect(toAnomalySeries({ ...activity, series: [activity.series[0]] }, range, 'hour')).toEqual(
      [],
    );
  });
});

describe('toAdChangeSeries', () => {
  it('returns the new and the deleted ads, zero without events', () => {
    const series = toAdChangeSeries(
      {
        ...activity,
        series: [
          { type: 'ad_created', channel: null, points: [{ t: hour(11).toISOString(), value: 6 }] },
        ],
      },
      range,
      'hour',
    );

    expect(series.map((s) => [s.label, s.points.map((p) => p.value)])).toEqual([
      ['New ads', [0, 6, 0]],
      ['Deleted ads', [0, 0, 0]],
    ]);
  });
});

describe('toSummaryTiles', () => {
  it('returns the totals with their change, the comparable ads and the outliers per channel', () => {
    expect(toSummaryTiles(activity)).toEqual([
      {
        label: 'Scraped ads',
        value: 40,
        change: 100,
        details: [{ label: '3+ prices', value: 10, change: 100 }],
      },
      {
        label: 'Country outliers',
        value: 3,
        change: null,
        details: [
          { label: 'outliers-de', value: 1, change: null },
          { label: '#3', value: 2, change: null },
        ],
      },
      {
        label: 'Ad balance',
        value: 4,
        change: null,
        details: [
          { label: 'New ads', value: 6, change: 100 },
          { label: 'Deleted ads', value: 2, change: null },
        ],
      },
      { label: 'Price drops', value: 4, change: -50, details: [] },
    ]);
  });

  it('lists the channels of the settings first, in their order, with 0 without outliers', () => {
    const [, outliers] = toSummaryTiles({
      ...activity,
      countryOutlierChannels: [
        { id: '5', name: 'outliers-pl' },
        { id: '3', name: 'outliers-fr' },
      ],
    });

    expect(outliers.details.map((detail) => [detail.label, detail.value])).toEqual([
      ['outliers-pl', 0],
      ['outliers-fr', 2],
      ['#1', 1],
    ]);
  });

  it('leaves out the comparable ads without the minPrices setting', () => {
    const [scraped] = toSummaryTiles({ ...activity, comparable: undefined });

    expect(scraped.details).toEqual([]);
  });
});
