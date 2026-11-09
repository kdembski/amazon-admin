import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StatsApiService } from '@app/core/api/stats-api-service';
import { loadActivity } from '@app/features/overview/load-activity';
import { activity } from './store-fixtures';

describe('loadActivity', () => {
  it('loads the activity of the range', () => {
    const api = { getActivity: vi.fn(() => of(activity)) };
    const range = { from: new Date(0), to: new Date(1) };
    TestBed.configureTestingModule({ providers: [{ provide: StatsApiService, useValue: api }] });

    TestBed.runInInjectionContext(loadActivity)(range).subscribe();

    expect(api.getActivity).toHaveBeenCalledWith(range);
  });
});
