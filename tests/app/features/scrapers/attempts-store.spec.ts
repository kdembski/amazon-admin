import { AttemptsStore } from '@app/features/scrapers/attempts-store';
import { maxValues, setupStore, START } from './store-fixtures';

describe('AttemptsStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives attempts/item per country', () => {
    const { store } = setupStore(AttemptsStore);

    expect(maxValues(store.chart())).toEqual([['de', 1.5]]);
  });
});
