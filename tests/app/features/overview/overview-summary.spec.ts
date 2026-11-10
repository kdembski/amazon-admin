import { toSummaryTiles } from '@app/features/overview/overview-summary';
import { ActivityStatsDto } from '@app/types/api-dtos';

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
  comparable: { minPrices: 3, total: 10, previousTotal: 5, points: [] },
  countryOutlierChannels: [{ id: '1', name: 'outliers-de' }],
};

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
