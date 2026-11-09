import { AnomalyStore } from '@app/features/overview/anomaly-store';
import { setupStore, START } from './store-fixtures';

describe('AnomalyStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives no lines without sent anomalies', () => {
    const { store } = setupStore(AnomalyStore);

    expect(store.data()?.series).toEqual([]);
  });
});
