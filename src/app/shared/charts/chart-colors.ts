export const COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

export const seriesColor = (index: number) => COLORS[index % COLORS.length];

export const cssVar = (name: string, fallback: string) => {
  const probe = document.createElement('span');

  probe.style.color = `var(${name}, ${fallback})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();

  return color;
};
