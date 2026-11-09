import { signalStore } from '@ngrx/signals';
import { map } from 'rxjs';
import { withPolling } from '@app/shared/polling/with-polling';
import { loadLastHourAndDay } from '@app/shared/summary/summary';
import { loadActivity } from './load-activity';
import { toSummaryTiles } from './overview-summary';

export const SummaryStore = signalStore(
  withPolling(() => {
    const load = loadActivity();

    return () => loadLastHourAndDay((range) => load(range).pipe(map(toSummaryTiles)));
  }),
);
