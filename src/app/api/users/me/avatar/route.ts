import { UserService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const userService = new UserService();

/**
 * POST /api/users/me/avatar — Upload avatar URL
 */
export const POST = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const { avatarUrl } = body;

  if (!avatarUrl || typeof avatarUrl !== 'string') {
    const { AppError } = await import('@/server/utils');
    throw AppError.badRequest('avatarUrl is required');
  }

  const updated = await userService.updateAvatar(user.userId, avatarUrl);
  return successResponse(updated, 'Avatar updated');
});
