import { TransferStore } from '@app/features/scrapers/transfer-store';
import { maxValues, setupStore, START } from './store-fixtures';

describe('TransferStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives proxy and direct megabytes per country', () => {
    const { store } = setupStore(TransferStore);

    expect(maxValues(store.chart())).toEqual([
      ['de proxy', 3],
      ['de direct', 1],
    ]);
  });

  it('switches the countries off and on without a reload', () => {
    const { api, store } = setupStore(TransferStore);
    const calls = api.getCountSeries.mock.calls.length;
    const hidden = () => store.chart()?.series.map((line) => line.hidden);

    expect(store.countries()).toEqual(['de']);
    expect(store.visibleCountries()).toEqual(['de']);
    expect(hidden()).toEqual([false, false]);

    store.setVisibleCountries([]);

    expect(store.visibleCountries()).toEqual([]);
    expect(hidden()).toEqual([true, true]);

    store.setVisibleCountries(['de']);

    expect(hidden()).toEqual([false, false]);
    expect(api.getCountSeries.mock.calls.length).toBe(calls);
  });
});
