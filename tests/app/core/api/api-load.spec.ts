import { Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { apiLoad } from '@app/core/api/api-load';
import { TimeRange } from '@app/types/time-range';

@Service()
class TestApi {
  get(range: TimeRange) {
    return of(range.to.getTime() - range.from.getTime());
  }
}

describe('apiLoad', () => {
  it('injects the service and passes it the range', async () => {
    const createLoad = apiLoad(TestApi, (api, range) => api.get(range));
    const load = TestBed.runInInjectionContext(createLoad);

    expect(await firstValueFrom(load({ from: new Date(0), to: new Date(5) }))).toBe(5);
  });
});
