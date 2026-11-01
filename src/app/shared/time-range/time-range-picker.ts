import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { addDays, differenceInCalendarDays, startOfDay } from 'date-fns';
import { RangePreset } from '@app/types/time-range';
import { MAX_RANGE_MS } from './time-range';
import { TimeRangeStore } from './time-range-store';

@Component({
  selector: 'app-time-range-picker',
  imports: [MatButtonToggleModule, MatDatepickerModule, MatFormFieldModule],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'pl-PL' }],
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
  protected readonly start = signal<Date | null>(null);

  choosePreset(preset: RangePreset) {
    this.error.set(null);
    this.store.select({ preset });
  }

  chooseDays(days: (Date | null)[] | null) {
    const [first, last] = days ?? [];

    if (!first || !last) {
      return;
    }

    if (differenceInCalendarDays(last, first) + 1 > 30) {
      this.error.set('Maksymalnie 30 dni');
      return;
    }

    const to = addDays(startOfDay(last), 1);
    // 30 days across the October DST change last 30 × 24 h + 1 h, more than the API accepts.
    const from = new Date(Math.max(startOfDay(first).getTime(), to.getTime() - MAX_RANGE_MS));

    this.error.set(null);
    this.store.select({ from, to });
  }
}
