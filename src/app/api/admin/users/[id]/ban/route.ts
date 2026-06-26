import { UserService, AuditLogService } from '@/server/services';
import { validateBody, banUserSchema } from '@/server/validators';
import { withErrorHandler, successResponse, authenticateRequest, authorizeRole } from '@/server/utils';

const userService = new UserService();
const auditService = new AuditLogService();

/**
 * POST /api/admin/users/[id]/ban — Ban a user
 */
export const POST = withErrorHandler(async (request, context) => {
  const admin = await authenticateRequest(request);
  authorizeRole(admin, 'admin');

  const { id } = await context!.params;
  const body = await request.json();
  const { reason } = validateBody(banUserSchema, body);

  const banned = await userService.banUser(id, reason);

  await auditService.log(
    'user_banned', admin.userId, admin.email,
    'user', id,
    { reason: { from: null, to: reason } }
  );

  return successResponse(banned, 'User banned');
});
