import { AuditLogService } from '@/server/services';
import { withErrorHandler, successResponse, paginatedResponse, parsePagination, authenticateRequest, authorizeRole } from '@/server/utils';

const auditService = new AuditLogService();

/**
 * GET /api/admin/audit-logs — Get audit logs (admin)
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'admin');

  const { searchParams } = new URL(request.url);
  const { page, limit, offset } = parsePagination(searchParams);

  const userId = searchParams.get('userId');
  if (userId) {
    const logs = await auditService.getUserLogs(userId);
    return successResponse(logs);
  }

  const { data, total } = await auditService.getLogs(limit, offset);
  return paginatedResponse(data, total, page, limit);
});
