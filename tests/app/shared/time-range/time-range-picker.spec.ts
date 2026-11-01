import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TimeRangePicker } from '@app/shared/time-range/time-range-picker';
import { TimeRangeStore } from '@app/shared/time-range/time-range-store';
import { RangeSelection } from '@app/types/time-range';

const setup = (selection: RangeSelection = { preset: '24h' }) => {
  const store = { selection: signal(selection), select: vi.fn().mockResolvedValue(true) };
  TestBed.configureTestingModule({ providers: [{ provide: TimeRangeStore, useValue: store }] });
  const fixture = TestBed.createComponent(TimeRangePicker);
  return { store, picker: fixture.componentInstance, fixture };
};

describe('TimeRangePicker', () => {
  it('selects a preset', () => {
    const { store, picker } = setup();

    picker.choosePreset('7d');

    expect(store.select).toHaveBeenCalledWith({ preset: '7d' });
  });

  it('shows the preset of the store and no days for a preset', () => {
    const { picker } = setup({ preset: '30d' });

    expect(picker.preset()).toBe('30d');
    expect(picker.days()).toBeNull();
  });

  it('selects whole local days from the first to the end of the last', () => {
    const { store, picker } = setup();

    picker.chooseDays([new Date(2026, 9, 20), new Date(2026, 9, 22)]);

    expect(store.select).toHaveBeenCalledWith({
      from: new Date(2026, 9, 20),
      to: new Date(2026, 9, 23),
    });
    expect(picker.error()).toBeNull();
  });

  it('waits for the second day', () => {
    const { store, picker } = setup();

    picker.chooseDays([new Date(2026, 9, 20), null]);

    expect(store.select).not.toHaveBeenCalled();
  });

  it('rejects more than 30 days', () => {
    const { store, picker } = setup();

    picker.chooseDays([new Date(2026, 8, 1), new Date(2026, 9, 1)]);

    expect(store.select).not.toHaveBeenCalled();
    expect(picker.error()).toBe('Maksymalnie 30 dni');
  });

  it('shows the rejection to the user', async () => {
    const { picker, fixture } = setup();

    picker.chooseDays([new Date(2026, 8, 1), new Date(2026, 9, 1)]);
    await fixture.whenStable();

    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role=alert]');
    expect(alert?.textContent?.trim()).toBe('Maksymalnie 30 dni');
  });

  it('accepts 30 days across the DST change, capped at 30 × 24 h', () => {
    const { store, picker } = setup();

    picker.chooseDays([new Date(2026, 9, 2), new Date(2026, 9, 31)]);

    const to = new Date(2026, 10, 1);
    expect(store.select).toHaveBeenCalledWith({
      from: new Date(to.getTime() - 30 * 86_400_000),
      to,
    });
  });

  it('shows the days of a custom range and no preset', () => {
    const { picker } = setup({ from: new Date(2026, 9, 20), to: new Date(2026, 9, 23) });

    expect(picker.preset()).toBeNull();
    expect(picker.days()).toEqual([new Date(2026, 9, 20), new Date(2026, 9, 22)]);
  });

  it('renders the preset buttons', async () => {
    const { fixture } = setup();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('24h');
    expect(text).toContain('7 dni');
    expect(text).toContain('30 dni');
    expect(fixture.nativeElement.querySelector('mat-button-toggle-group')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('mat-date-range-input')).not.toBeNull();
  });
});
