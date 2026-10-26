import { toChartPoints } from '@app/shared/charts/to-chart-points';

const range = {
  from: new Date('2026-10-26T10:00:00.000Z'),
  to: new Date('2026-10-26T12:00:00.000Z'),
};
const points = [{ t: '2026-10-26T11:00:00.000Z', value: 3 }];

describe('toChartPoints', () => {
  it('fills the hours with zeros and turns them into dates', () => {
    expect(toChartPoints(points, range, 'hour')).toEqual([
      { t: new Date('2026-10-26T10:00:00.000Z'), value: 0 },
      { t: new Date('2026-10-26T11:00:00.000Z'), value: 3 },
    ]);
  });

  it('sums the hours of a local day', () => {
    expect(toChartPoints(points, range, 'day')).toEqual([{ t: new Date(2026, 9, 26), value: 3 }]);
  });
});
