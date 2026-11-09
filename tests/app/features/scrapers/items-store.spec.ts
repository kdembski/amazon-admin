import { ItemsStore } from '@app/features/scrapers/items-store';
import { setupStore, START } from './store-fixtures';

describe('ItemsStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives one hourly line of items/s per scraper', () => {
    const { store } = setupStore(ItemsStore);

    expect(store.data()?.unit).toBe('hour');
    expect(store.data()?.series[0].label).toBe('amazon-pdp-1');
    expect(store.data()?.series[0].points).toHaveLength(24);
  });
});
