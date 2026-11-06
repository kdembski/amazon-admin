import { formatCompact, formatNumber } from '@app/shared/format/format-number';

describe('formatNumber', () => {
  it('shows two decimals in Polish format', () => {
    expect(formatNumber(1234.5)).toBe('1234,50');
    expect(formatNumber(0.125)).toBe('0,13');
  });

  it('shows a dash for a missing value', () => {
    expect(formatNumber(null)).toBe('—');
  });
});

describe('formatCompact', () => {
  it('shortens thousands and millions with a lowercase suffix', () => {
    expect(formatCompact(123_456)).toBe('123k');
    expect(formatCompact(1_234_567)).toBe('1.2m');
    expect(formatCompact(42)).toBe('42');
  });
});
