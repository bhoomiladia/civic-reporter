import { GeocodingService } from '@/server/services';
import { withErrorHandler, successResponse, AppError } from '@/server/utils';

const geocodingService = new GeocodingService();

/**
 * GET /api/map/reverse-geocode?lat=X&lng=Y — Reverse geocode
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');

  if (isNaN(lat) || isNaN(lng)) throw AppError.badRequest('lat and lng are required');

  const result = await geocodingService.reverseGeocode(lat, lng);
  return successResponse(result);
});
