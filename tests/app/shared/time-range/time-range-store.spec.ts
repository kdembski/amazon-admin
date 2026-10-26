import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TimeRangeStore } from '@app/shared/time-range/time-range-store';

@Component({ template: '' })
class Blank {}

const setup = async (url = '/') => {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: '**', component: Blank }])],
  });
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  return { router, store: TestBed.inject(TimeRangeStore) };
};

describe('TimeRangeStore', () => {
  it('starts with the range of the current URL', async () => {
    const { store } = await setup('/scrapers?range=7d');

    expect(store.selection()).toEqual({ preset: '7d' });
  });

  it('defaults to 24h', async () => {
    const { store } = await setup();

    expect(store.selection()).toEqual({ preset: '24h' });
  });

  it('follows the range param after navigation', async () => {
    const { store, router } = await setup();

    await router.navigateByUrl('/?range=30d');

    expect(store.selection()).toEqual({ preset: '30d' });
  });

  it('keeps the same selection object when the range param did not change', async () => {
    const { store, router } = await setup('/?range=7d');
    const before = store.selection();

    await router.navigateByUrl('/scrapers?range=7d');

    expect(store.selection()).toBe(before);
  });

  it('select writes the range param and keeps the other params', async () => {
    const { store, router } = await setup('/scrapers?tab=a');

    await store.select({ preset: '30d' });

    expect(router.url).toBe('/scrapers?tab=a&range=30d');
    expect(store.selection()).toEqual({ preset: '30d' });
  });

  it('resolve ends a preset now', async () => {
    const { store } = await setup('/?range=24h');
    const before = Date.now();

    const { from, to } = store.resolve();

    expect(to.getTime()).toBeGreaterThanOrEqual(before);
    expect(to.getTime() - from.getTime()).toBe(86_400_000);
  });
});
