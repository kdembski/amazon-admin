import { groupedChartStore } from '@app/features/scrapers/grouped-chart-store';
import { maxValues, setupStore, START } from './store-fixtures';

const WastedCountStore = groupedChartStore((point) => point.wasted);

describe('groupedChartStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('starts grouped by country', () => {
    const { store } = setupStore(WastedCountStore);

    expect(store.group()).toBe('country');
    expect(maxValues(store.chart())).toEqual([['de', 20]]);
  });

  it('switches between countries and scrapers without a reload', () => {
    const { api, store } = setupStore(WastedCountStore);
    const calls = api.getCountSeries.mock.calls.length;

    store.setGroup('scraper');

    expect(store.group()).toBe('scraper');
    expect(maxValues(store.chart())).toEqual([['amazon-pdp-1', 50]]);
    expect(api.getCountSeries.mock.calls.length).toBe(calls);
  });
});
