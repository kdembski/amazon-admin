import { TimeRange } from '@app/types/time-range';

export const rangeParams = ({ from, to }: TimeRange) => ({
  from: from.toISOString(),
  to: to.toISOString(),
});
