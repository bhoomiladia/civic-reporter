import { IssueService } from '@/server/services';
import { withErrorHandler, successResponse } from '@/server/utils';

const issueService = new IssueService();

/**
 * GET /api/issues/[id]/timeline — Get issue timeline
 */
export const GET = withErrorHandler(async (_request, context) => {
  const { id } = await context!.params;
  const timeline = await issueService.getIssueTimeline(id);
  return successResponse(timeline);
});
