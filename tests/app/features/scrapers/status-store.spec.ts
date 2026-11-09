import { StatusStore } from '@app/features/scrapers/status-store';
import { setupStore, START, status } from './store-fixtures';

describe('StatusStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('measures the statuses when they arrive', () => {
    const { store } = setupStore(StatusStore);

    expect(store.data()).toEqual([
      {
        ...status,
        lastReportAt: new Date('2026-10-26T09:50:00.000Z'),
        minutesAgo: 10,
        stopped: true,
      },
    ]);
  });
});
