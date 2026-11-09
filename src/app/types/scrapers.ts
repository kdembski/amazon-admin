import { Signal } from '@angular/core';
import { ScraperMetricSummary, ScraperSeriesPoint, ScraperStatus } from './api-dtos';
import { ChartSeries } from './chart';

export type ScraperChartField = keyof Omit<ScraperSeriesPoint, 't' | 'requests'>;

export type ScraperSummaryField = (summary: ScraperMetricSummary) => number;

export interface ScraperStatusRow extends Omit<ScraperStatus, 'lastReportAt'> {
  lastReportAt: Date;
  minutesAgo: number;
  stopped: boolean;
}

export interface CountryTransfer {
  country: string;
  series: ChartSeries[];
}

export interface CountryToggleSource {
  countries: Signal<string[]>;
  visibleCountries: Signal<string[]>;
  setVisibleCountries: (visible: string[]) => void;
}
