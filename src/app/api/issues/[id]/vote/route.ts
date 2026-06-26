import { IssueService } from '@/server/services';
import { validateBody, voteSchema } from '@/server/validators';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const issueService = new IssueService();

/**
 * POST /api/issues/[id]/vote — Vote on an issue (toggle)
 */
export const POST = withErrorHandler(async (request, context) => {
  const user = await authenticateRequest(request);
  const { id } = await context!.params;
  const body = await request.json();
  const { type } = validateBody(voteSchema, body);

  await issueService.voteIssue(id, user.userId, type);
  return successResponse(null, 'Vote recorded');
});
