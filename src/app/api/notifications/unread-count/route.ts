import { NotificationService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const notifService = new NotificationService();

/**
 * GET /api/notifications/unread-count — Get unread notification count
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const count = await notifService.getUnreadCount(user.userId);
  return successResponse({ count });
});
