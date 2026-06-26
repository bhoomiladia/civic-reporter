import { AssignmentService } from '@/server/services';
import { validateBody, gpsUpdateSchema } from '@/server/validators';
import { withErrorHandler, successResponse, authenticateRequest, authorizeRole } from '@/server/utils';

const assignmentService = new AssignmentService();

/**
 * POST /api/workers/gps — Update worker GPS location
 */
export const POST = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'worker', 'admin');

  const body = await request.json();
  const { lat, lng } = validateBody(gpsUpdateSchema, body);

  await assignmentService.updateGps(user.userId, lat, lng);
  return successResponse(null, 'GPS updated');
});
