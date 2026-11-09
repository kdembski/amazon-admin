import { Http503Store } from '@app/features/scrapers/http503-store';
import { maxValues, setupStore, START } from './store-fixtures';

describe('Http503Store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives 503 % per country', () => {
    const { store } = setupStore(Http503Store);

    expect(maxValues(store.chart())).toEqual([['de', 5]]);
  });
});
