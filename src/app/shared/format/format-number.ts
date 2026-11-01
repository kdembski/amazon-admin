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

export const formatSigned = (value: number, digits = 2) => {
  return `${value > 0 ? '+' : ''}${formatNumber(value, digits)}`;
};
