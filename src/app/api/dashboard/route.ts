import { DashboardService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest, authorizeRole } from '@/server/utils';

const dashboardService = new DashboardService();

/**
 * GET /api/dashboard — Get role-specific dashboard data
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || user.role;

  switch (type) {
    case 'citizen': {
      const data = await dashboardService.getCitizenDashboard(user.userId);
      return successResponse(data);
    }
    case 'worker': {
      authorizeRole(user, 'worker', 'admin');
      const data = await dashboardService.getWorkerDashboard(user.userId);
      return successResponse(data);
    }
    case 'municipality': {
      authorizeRole(user, 'municipality', 'admin');
      const municipalityId = searchParams.get('municipalityId') || user.userId;
      const data = await dashboardService.getMunicipalityDashboard(municipalityId);
      return successResponse(data);
    }
    case 'admin': {
      authorizeRole(user, 'admin');
      const data = await dashboardService.getAdminDashboard();
      return successResponse(data);
    }
    default: {
      const data = await dashboardService.getCitizenDashboard(user.userId);
      return successResponse(data);
    }
  }
});
