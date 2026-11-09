import { CaptchaStore } from '@app/features/scrapers/captcha-store';
import { maxValues, setupStore, START } from './store-fixtures';

describe('CaptchaStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => vi.useRealTimers());

  it('derives captcha % per country', () => {
    const { store } = setupStore(CaptchaStore);

    expect(maxValues(store.chart())).toEqual([['de', 2]]);
  });
});
