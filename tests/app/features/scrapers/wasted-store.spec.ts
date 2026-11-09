import { WastedStore } from '@app/features/scrapers/wasted-store';
import { maxValues, setupStore, START } from './store-fixtures';

describe('WastedStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives wasted % per country', () => {
    const { store } = setupStore(WastedStore);

    expect(maxValues(store.chart())).toEqual([['de', 10]]);
  });
});
