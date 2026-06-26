import { UserService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest, authorizeMinLevel } from '@/server/utils';

const userService = new UserService();

/**
 * GET /api/users/[id] — Get user by ID
 */
export const GET = withErrorHandler(async (request, context) => {
  await authenticateRequest(request);
  const { id } = await context!.params;
  const user = await userService.getUserById(id);
  return successResponse(user);
});
