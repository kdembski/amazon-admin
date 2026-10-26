export interface PollState<T> {
  data: T | null;
  error: string | null;
  staleSince: Date | null;
  loading: boolean;
}

export type PollEvent<T> =
  { type: 'start' } | { type: 'data'; data: T } | { type: 'error'; error: string };
