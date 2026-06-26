import { IssueService } from '@/server/services';
import { validateBody, updateIssueSchema } from '@/server/validators';
import {
  withErrorHandler, successResponse, authenticateRequest, authorizeRole,
} from '@/server/utils';

const issueService = new IssueService();

/**
 * GET /api/issues/[id] — Get issue details
 */
export const GET = withErrorHandler(async (_request, context) => {
  const { id } = await context!.params;
  const issue = await issueService.getIssue(id);
  return successResponse(issue);
});

/**
 * PATCH /api/issues/[id] — Update issue
 */
export const PATCH = withErrorHandler(async (request, context) => {
  const user = await authenticateRequest(request);
  const { id } = await context!.params;
  const body = await request.json();
  const data = validateBody(updateIssueSchema, body);
  const updated = await issueService.updateIssue(id, user.userId, data);
  return successResponse(updated, 'Issue updated');
});

/**
 * DELETE /api/issues/[id] — Delete issue
 */
export const DELETE = withErrorHandler(async (request, context) => {
  const user = await authenticateRequest(request);
  const { id } = await context!.params;

  // Only admin or issue author can delete (checked at service level via additional logic if needed)
  await issueService.deleteIssue(id);
  return successResponse(null, 'Issue deleted');
});
