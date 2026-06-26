import { IssueService, UserService } from '@/server/services';
import { withErrorHandler, successResponse } from '@/server/utils';

const issueService = new IssueService();
const userService = new UserService();

/**
 * GET /api/community — Get community data (stats, trending, contributors, recent)
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section'); // trending, contributors, resolved, activity

  if (section === 'trending') {
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const issues = await issueService.getTrendingIssues(limit);
    return successResponse(issues);
  }

  if (section === 'contributors') {
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const users = await userService.getTopContributors(limit);
    return successResponse(users);
  }

  if (section === 'resolved') {
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const issues = await issueService.getRecentlyResolved(limit);
    return successResponse(issues);
  }

  // Default: return all community data
  const [trending, contributors, resolved] = await Promise.all([
    issueService.getTrendingIssues(10),
    userService.getTopContributors(5),
    issueService.getRecentlyResolved(5),
  ]);

  return successResponse({
    trending,
    topContributors: contributors,
    recentlyResolved: resolved,
  });
});
