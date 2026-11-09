const formatters = new Map<number, Intl.NumberFormat>();

const formatter = (digits: number) => {
  if (!formatters.has(digits)) {
    formatters.set(
      digits,
      new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }),
    );
  }

  return formatters.get(digits)!;
};

export const formatNumber = (value: number | null, digits = 2) => {
  return value === null ? '—' : formatter(digits).format(value);
};

const compactFormatter = (digits: number) => {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: digits });
};

const compactThousands = compactFormatter(0);
const compactMillions = compactFormatter(1);

export const formatCompact = (value: number) => {
  const formatter = Math.abs(value) >= 1_000_000 ? compactMillions : compactThousands;

  return formatter.format(value).toLowerCase();
};
