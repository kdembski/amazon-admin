import { ScraperCountPoint } from '@app/types/api-dtos';

export const megabytes = (bytes: number) => bytes / 1_048_576;

export const requestPercent = (count: (point: ScraperCountPoint) => number) => {
  return (point: ScraperCountPoint) => {
    return point.requests > 0 ? (count(point) / point.requests) * 100 : 0;
  };
};

export const attemptsPerItem = (point: ScraperCountPoint) => {
  return point.items > 0 ? point.itemAttempts / point.items : 0;
};

export const proxyMegabytes = (point: ScraperCountPoint) => megabytes(point.proxyBytes);

export const directMegabytes = (point: ScraperCountPoint) => megabytes(point.directBytes);
