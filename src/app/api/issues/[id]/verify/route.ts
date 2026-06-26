import { IssueService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const issueService = new IssueService();

/**
 * POST /api/issues/[id]/verify — Verify an issue exists
 */
export const POST = withErrorHandler(async (request, context) => {
  const user = await authenticateRequest(request);
  const { id } = await context!.params;
  await issueService.verifyIssue(id, user.userId);
  return successResponse(null, 'Issue verified');
});
