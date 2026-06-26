import { GeocodingService } from '@/server/services';
import { withErrorHandler, successResponse, AppError } from '@/server/utils';

const geocodingService = new GeocodingService();

/**
 * GET /api/map/forward-geocode?q=address — Forward geocode (address → coordinates)
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  if (!q) throw AppError.badRequest('q (query) is required');

  const results = await geocodingService.forwardGeocode(q, limit);
  return successResponse(results);
});
