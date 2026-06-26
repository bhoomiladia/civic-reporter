import { UserService, AuditLogService } from '@/server/services';
import { validateBody, banUserSchema } from '@/server/validators';
import {
  withErrorHandler, successResponse, paginatedResponse, parsePagination,
  authenticateRequest, authorizeRole,
} from '@/server/utils';

const userService = new UserService();
const auditService = new AuditLogService();

/**
 * GET /api/admin/users — List all users (admin)
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'admin');

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);

  const { data, total } = await userService.getAllUsers(limit, offset);
  return paginatedResponse(data, total, page, limit);
});
