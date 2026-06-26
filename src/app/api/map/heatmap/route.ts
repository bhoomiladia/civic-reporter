import { IssueService } from '@/server/services';
import { withErrorHandler, successResponse, AppError } from '@/server/utils';

const issueService = new IssueService();

/**
 * GET /api/map/heatmap?lat=X&lng=Y&radius=Z — Get heatmap data points
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const radius = parseFloat(searchParams.get('radius') || '10');

  if (isNaN(lat) || isNaN(lng)) throw AppError.badRequest('lat and lng are required');

  const issues = await issueService.getNearbyIssues(lat, lng, radius);

  // Generate heatmap points with intensity based on priority and upvotes
  const points = issues.map((issue) => {
    const priorityWeight: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    const intensity = (priorityWeight[issue.priority] || 1) + Math.min(issue.upvotes / 10, 5);

    return {
      lat: issue.location.lat,
      lng: issue.location.lng,
      intensity: Math.round(intensity * 10) / 10,
      category: issue.category,
    };
  });

  return successResponse(points);
});
