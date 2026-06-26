import { UserService } from '@/server/services';
import { validateBody, updateProfileSchema } from '@/server/validators';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const userService = new UserService();

/**
 * GET /api/users/me — Get current user profile
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const profile = await userService.getProfile(user.userId);
  return successResponse(profile);
});

/**
 * PATCH /api/users/me — Update current user profile
 */
export const PATCH = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const data = validateBody(updateProfileSchema, body);
  const updated = await userService.updateProfile(user.userId, data);
  return successResponse(updated, 'Profile updated');
});
