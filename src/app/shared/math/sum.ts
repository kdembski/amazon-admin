export const sumBy = <T>(items: T[], value: (item: T) => number) => {
  return items.reduce((total, item) => total + value(item), 0);
};

export const sumFields = <T extends Record<K, number>, K extends keyof T>(
  items: T[],
  fields: readonly K[],
) => {
  const sums = fields.map((field) => [field, sumBy(items, (item) => item[field])]);

  return Object.fromEntries(sums) as Pick<T, K>;
};
