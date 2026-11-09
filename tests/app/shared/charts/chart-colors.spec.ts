import { COLORS, cssVar, seriesColor } from '@app/shared/charts/chart-colors';

describe('seriesColor', () => {
  it('cycles through the palette', () => {
    expect(seriesColor(0)).toBe(COLORS[0]);
    expect(seriesColor(COLORS.length + 1)).toBe(COLORS[1]);
  });
});

describe('cssVar', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reads the computed color of a probe styled with the variable and removes the probe', () => {
    const computed = vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      expect((element as HTMLElement).style.color).toBe('var(--test-color, #000)');

      return { color: 'rgb(1, 2, 3)' } as CSSStyleDeclaration;
    });

    expect(cssVar('--test-color', '#000')).toBe('rgb(1, 2, 3)');
    expect(computed).toHaveBeenCalledTimes(1);
    expect(document.body.querySelector('span')).toBeNull();
  });
});
