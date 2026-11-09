import { sumBy, sumFields } from '@app/shared/math/sum';

describe('sumBy', () => {
  it('sums the values of the items', () => {
    expect(sumBy([{ n: 1 }, { n: 2.5 }], (item) => item.n)).toBe(3.5);
  });

  it('gives 0 without items', () => {
    expect(sumBy([], () => 1)).toBe(0);
  });
});

describe('sumFields', () => {
  it('sums every listed field and leaves the others out', () => {
    const items = [
      { t: 'a', a: 1, b: 2 },
      { t: 'b', a: 3, b: 4 },
    ];

    expect(sumFields(items, ['a', 'b'])).toEqual({ a: 4, b: 6 });
  });

  it('gives zeros without items', () => {
    expect(sumFields<{ a: number }, 'a'>([], ['a'])).toEqual({ a: 0 });
  });
});
