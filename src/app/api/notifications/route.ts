import { NotificationService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const notifService = new NotificationService();

/**
 * GET /api/notifications — Get user notifications
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get('unread') === 'true';

  const notifications = await notifService.getUserNotifications(user.userId, unreadOnly);
  return successResponse(notifications);
});

/**
 * PATCH /api/notifications — Mark all as read
 */
export const PATCH = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  await notifService.markAllAsRead(user.userId);
  return successResponse(null, 'All notifications marked as read');
});
