import { AdChangeStore } from '@app/features/overview/ad-change-store';
import { setupStore, START } from './store-fixtures';

describe('AdChangeStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives the new and deleted ads', () => {
    const { store } = setupStore(AdChangeStore);

    expect(store.data()?.series.map((s) => s.label)).toEqual(['New ads', 'Deleted ads']);
  });
});
