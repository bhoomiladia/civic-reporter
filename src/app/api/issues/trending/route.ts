import { IssueService } from '@/server/services';
import { withErrorHandler, successResponse } from '@/server/utils';

const issueService = new IssueService();

/**
 * GET /api/issues/trending — Get trending issues (most upvoted active issues)
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const issues = await issueService.getTrendingIssues(limit);
  return successResponse(issues);
});
