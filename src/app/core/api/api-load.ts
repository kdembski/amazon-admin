import { inject, ProviderToken } from '@angular/core';
import { Observable } from 'rxjs';
import { TimeRange } from '@app/types/time-range';

export const apiLoad = <A, T>(
  service: ProviderToken<A>,
  load: (api: A, range: TimeRange) => Observable<T>,
) => {
  return () => {
    const api = inject(service);

    return (range: TimeRange) => load(api, range);
  };
};
