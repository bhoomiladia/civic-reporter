import { IssueService } from '@/server/services';
import { withErrorHandler, successResponse, AppError } from '@/server/utils';

const issueService = new IssueService();

/**
 * GET /api/issues/nearby?lat=X&lng=Y&radius=Z — Get nearby issues
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);

  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radius = parseFloat(searchParams.get('radius') || '5');

  if (isNaN(lat) || isNaN(lng)) {
    throw AppError.badRequest('lat and lng are required');
  }

  const issues = await issueService.getNearbyIssues(lat, lng, radius);
  return successResponse(issues);
});
