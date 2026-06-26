import { UserService } from '@/server/services';
import { withErrorHandler, successResponse, paginatedResponse, parsePagination, authenticateRequest, authorizeMinLevel } from '@/server/utils';

const userService = new UserService();

/**
 * GET /api/users — List all users (admin only)
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeMinLevel(user, 'admin');

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);

  const search = searchParams.get('search');
  if (search) {
    const users = await userService.searchUsers(search);
    return successResponse(users);
  }

  const { data, total } = await userService.getAllUsers(limit, offset);
  return paginatedResponse(data, total, page, limit);
});
