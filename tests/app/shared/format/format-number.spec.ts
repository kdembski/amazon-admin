import { formatMegabytes, formatNumber, formatSigned } from '@app/shared/format/format-number';

describe('formatNumber', () => {
  it('shows two decimals in Polish format', () => {
    expect(formatNumber(1234.5)).toBe('1234,50');
    expect(formatNumber(0.125)).toBe('0,13');
  });

  it('shows a dash for a missing value', () => {
    expect(formatNumber(null)).toBe('—');
  });
});

describe('formatSigned', () => {
  it('prefixes growth with + and keeps the minus of a drop', () => {
    expect(formatSigned(0.12)).toBe('+0,12');
    expect(formatSigned(-0.3)).toBe('-0,30');
    expect(formatSigned(0)).toBe('0,00');
  });
});

describe('formatMegabytes', () => {
  it('shows bytes as megabytes with one decimal', () => {
    expect(formatMegabytes(1_572_864)).toBe('1,5');
    expect(formatMegabytes(0)).toBe('0,0');
  });
});
