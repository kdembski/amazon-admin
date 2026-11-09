import { TestBed } from '@angular/core/testing';
import { ScrapedStore } from '@app/features/overview/scraped-store';
import { setupStore, START } from './store-fixtures';

describe('ScrapedStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives an hourly chart of the last day', () => {
    const { store } = setupStore(ScrapedStore);

    expect(store.data()?.unit).toBe('hour');
    expect(store.data()?.series[0].points).toHaveLength(24);
  });

  it('reloads with the range of a new preset', () => {
    const { api, store } = setupStore(ScrapedStore);
    const calls = api.getActivity.mock.calls.length;

    store.setPreset('30d');
    TestBed.tick();

    expect(api.getActivity).toHaveBeenCalledTimes(calls + 1);
    expect(api.getActivity).toHaveBeenLastCalledWith({
      from: new Date(START.getTime() - 30 * 86_400_000),
      to: START,
    });
    expect(store.data()?.unit).toBe('day');
  });
});
