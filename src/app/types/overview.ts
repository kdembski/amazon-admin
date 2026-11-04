import { ActivityStatsDto, LogStatsDto } from './api-dtos';
import { TimeRange } from './time-range';

export interface OverviewData {
  activity: ActivityStatsDto;
  logs: LogStatsDto;
  range: TimeRange;
}
