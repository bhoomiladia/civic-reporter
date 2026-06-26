import { CommentService } from '@/server/services';
import { validateBody, createCommentSchema } from '@/server/validators';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const commentService = new CommentService();

/**
 * GET /api/issues/[id]/comments — Get comments for an issue
 */
export const GET = withErrorHandler(async (_request, context) => {
  const { id } = await context!.params;
  const comments = await commentService.getComments(id);
  return successResponse(comments);
});

/**
 * POST /api/issues/[id]/comments — Create a comment on an issue
 */
export const POST = withErrorHandler(async (request, context) => {
  const user = await authenticateRequest(request);
  const { id } = await context!.params;
  const body = await request.json();
  const data = validateBody(createCommentSchema, body);

  const comment = await commentService.createComment(user.userId, {
    issueId: id,
    content: data.content,
    parentId: data.parentId,
  });

  return successResponse(comment, 'Comment added', 201);
});
