import { IssueService } from '@/server/services';
import { validateBody, createIssueSchema } from '@/server/validators';
import {
  withErrorHandler, successResponse, paginatedResponse,
  parsePagination, authenticateRequest,
} from '@/server/utils';
import type { IssueCategory, IssueStatus, IssuePriority } from '@/server/types';

const issueService = new IssueService();

/**
 * GET /api/issues — List issues with filters, search, pagination
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const { page, limit, sortBy, sortOrder } = parsePagination(searchParams);

  const filters: Record<string, unknown> = {};

  const category = searchParams.get('category');
  if (category) filters.category = category.split(',') as IssueCategory[];

  const status = searchParams.get('status');
  if (status) filters.status = status.split(',') as IssueStatus[];

  const priority = searchParams.get('priority');
  if (priority) filters.priority = priority.split(',') as IssuePriority[];

  const reportedBy = searchParams.get('reportedBy');
  if (reportedBy) filters.reportedBy = reportedBy;

  const assignedTo = searchParams.get('assignedTo');
  if (assignedTo) filters.assignedTo = assignedTo;

  const search = searchParams.get('search');
  if (search) filters.search = search;

  const { data, total } = await issueService.listIssues(
    filters as any, page, limit, sortBy, sortOrder
  );
  return paginatedResponse(data, total, page, limit);
});

/**
 * POST /api/issues — Create a new issue
 */
export const POST = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const body = await request.json();
  const data = validateBody(createIssueSchema, body);
  const issue = await issueService.createIssue(user.userId, data);
  return successResponse(issue, 'Issue reported successfully', 201);
});
