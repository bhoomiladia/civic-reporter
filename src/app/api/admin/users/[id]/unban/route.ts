import { UserService, AuditLogService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest, authorizeRole } from '@/server/utils';

const userService = new UserService();
const auditService = new AuditLogService();

/**
 * POST /api/admin/users/[id]/unban — Unban a user
 */
export const POST = withErrorHandler(async (request, context) => {
  const admin = await authenticateRequest(request);
  authorizeRole(admin, 'admin');

  const { id } = await context!.params;
  const unbanned = await userService.unbanUser(id);

  await auditService.log(
    'user_unbanned', admin.userId, admin.email,
    'user', id
  );

  return successResponse(unbanned, 'User unbanned');
});
