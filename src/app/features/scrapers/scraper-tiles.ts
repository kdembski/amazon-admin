import { sumBy } from '@app/shared/math/sum';
import { stat } from '@app/shared/summary/summary';
import { ScraperMetricSummary } from '@app/types/api-dtos';
import { ScraperSummaryField } from '@app/types/scrapers';
import { SummaryTile } from '@app/types/summary';
import { TimeRange } from '@app/types/time-range';
import { megabytes } from './scraper-count-metrics';

const rateTile = (
  summaries: ScraperMetricSummary[],
  label: string,
  digits: number,
  value: ScraperSummaryField,
  previous: ScraperSummaryField,
): SummaryTile => {
  return {
    ...stat(label, sumBy(summaries, value), sumBy(summaries, previous)),
    digits,
    column: 0,
    details: [],
  };
};

const shareOf = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const transferTile = (summaries: ScraperMetricSummary[]): SummaryTile => {
  const megabytesOf = (field: ScraperSummaryField) => megabytes(sumBy(summaries, field));
  const proxy = megabytesOf((summary) => summary.proxyBytes);
  const previousProxy = megabytesOf((summary) => summary.previousProxyBytes);
  const direct = megabytesOf((summary) => summary.directBytes);
  const previousDirect = megabytesOf((summary) => summary.previousDirectBytes);
  const total = proxy + direct;

  return {
    ...stat('Transfer in + out (MB)', total, previousProxy + previousDirect),
    digits: 1,
    column: 1,
    details: [
      { ...stat('Proxy', proxy, previousProxy), share: shareOf(proxy, total) },
      { ...stat('Direct', direct, previousDirect), share: shareOf(direct, total) },
    ],
  };
};

export const toScraperTiles = (
  summaries: ScraperMetricSummary[],
  range: TimeRange,
): SummaryTile[] => {
  const seconds = (range.to.getTime() - range.from.getTime()) / 1000;

  return [
    rateTile(
      summaries,
      'Requests',
      0,
      (summary) => summary.requests,
      (summary) => summary.previousRequests,
    ),
    rateTile(
      summaries,
      'Requests/s',
      1,
      (summary) => summary.requests / seconds,
      (summary) => summary.previousRequests / seconds,
    ),
    rateTile(
      summaries,
      'Items/s',
      2,
      (summary) => summary.itemsPerSecond,
      (summary) => summary.itemsPerSecond - summary.itemsPerSecondDiff,
    ),
    transferTile(summaries),
  ];
};
