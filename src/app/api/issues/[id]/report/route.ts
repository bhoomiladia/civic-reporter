import { IssueService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const issueService = new IssueService();

/**
 * POST /api/issues/[id]/report — Report an issue as inappropriate
 */
export const POST = withErrorHandler(async (request, context) => {
  await authenticateRequest(request);
  const { id } = await context!.params;
  await issueService.reportIssue(id);
  return successResponse(null, 'Issue reported');
});
