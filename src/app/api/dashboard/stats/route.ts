import { DashboardService } from '@/server/services';
import { withErrorHandler, successResponse } from '@/server/utils';

const dashboardService = new DashboardService();

/**
 * GET /api/dashboard/stats — Get global platform statistics (public)
 */
export const GET = withErrorHandler(async () => {
  const stats = await dashboardService.getGlobalStats();
  return successResponse(stats);
});
