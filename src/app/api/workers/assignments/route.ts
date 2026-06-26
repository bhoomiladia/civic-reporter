import { AssignmentService } from '@/server/services';
import { validateBody, updateAssignmentSchema, gpsUpdateSchema } from '@/server/validators';
import {
  withErrorHandler, successResponse, authenticateRequest, authorizeRole,
} from '@/server/utils';

const assignmentService = new AssignmentService();

/**
 * GET /api/workers/assignments — Get assignments for current worker
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'worker', 'admin');

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  const assignments = await assignmentService.getWorkerAssignments(user.userId, status);
  return successResponse(assignments);
});

/**
 * PATCH /api/workers/assignments — Update worker assignment (start work, mark completed, etc.)
 */
export const PATCH = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'worker', 'admin');

  const body = await request.json();
  const { assignmentId, ...data } = body;

  if (!assignmentId) {
    const { AppError } = await import('@/server/utils');
    throw AppError.badRequest('assignmentId is required');
  }

  const validated = validateBody(updateAssignmentSchema, data);
  const updated = await assignmentService.updateAssignment(assignmentId, validated);
  return successResponse(updated, 'Assignment updated');
});
