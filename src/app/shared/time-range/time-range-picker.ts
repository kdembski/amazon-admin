import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { addDays, startOfDay } from 'date-fns';
import { DatePicker } from 'primeng/datepicker';
import { SelectButton } from 'primeng/selectbutton';
import { RangePreset } from '@app/types/time-range';
import { isValidRange } from './time-range';
import { TimeRangeStore } from './time-range-store';

@Component({
  selector: 'app-time-range-picker',
  imports: [FormsModule, SelectButton, DatePicker],
  templateUrl: './time-range-picker.html',
  styleUrl: './time-range-picker.scss',
})
export class TimeRangePicker {
  private readonly store = inject(TimeRangeStore);

  protected readonly presets = [
    { label: '24h', value: '24h' },
    { label: '7 dni', value: '7d' },
    { label: '30 dni', value: '30d' },
  ];
  protected readonly today = new Date();

  readonly preset = computed(() => {
    const selection = this.store.selection();

    return 'preset' in selection ? selection.preset : null;
  });
  // A custom range ends at the start of the day after its last day.
  readonly days = computed(() => {
    const selection = this.store.selection();

    return 'preset' in selection ? null : [selection.from, addDays(selection.to, -1)];
  });
  readonly error = signal<string | null>(null);

  choosePreset(preset: RangePreset) {
    this.error.set(null);
    this.store.select({ preset });
  }

  chooseDays(days: (Date | null)[] | null) {
    const [first, last] = days ?? [];

    if (!first || !last) {
      return;
    }

    const range = { from: startOfDay(first), to: addDays(startOfDay(last), 1) };

    if (!isValidRange(range)) {
      this.error.set('Maksymalnie 30 dni');
      return;
    }

    this.error.set(null);
    this.store.select(range);
  }
}
