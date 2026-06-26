import { NotificationService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const notifService = new NotificationService();

/**
 * PATCH /api/notifications/[id] — Mark single notification as read
 */
export const PATCH = withErrorHandler(async (request, context) => {
  const user = await authenticateRequest(request);
  const { id } = await context!.params;
  await notifService.markAsRead(id, user.userId);
  return successResponse(null, 'Notification marked as read');
});
