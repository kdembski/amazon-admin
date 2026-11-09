import { Signal } from '@angular/core';
import { RangePreset } from './time-range';

export interface RangePanelSource {
  data: Signal<unknown>;
  error: Signal<string | null>;
  staleSince: Signal<Date | null>;
  preset: Signal<RangePreset>;
  setPreset: (preset: RangePreset) => void;
}
