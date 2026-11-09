import { apiLoad } from '@app/core/api/api-load';
import { StatsApiService } from '@app/core/api/stats-api-service';

export const loadActivity = apiLoad(StatsApiService, (api, range) => api.getActivity(range));
