import { Signal } from '@angular/core';
import { RangePreset } from './time-range';

// What a range panel needs from a store made with withPolling.
export interface RangePanelSource {
  data: Signal<unknown>;
  error: Signal<string | null>;
  staleSince: Signal<Date | null>;
  preset: Signal<RangePreset>;
  setPreset: (preset: RangePreset) => void;
}
