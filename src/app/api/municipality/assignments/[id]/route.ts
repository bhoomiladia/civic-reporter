import { AssignmentService } from '@/server/services';
import { validateBody, updateAssignmentSchema } from '@/server/validators';
import {
  withErrorHandler, successResponse, authenticateRequest, authorizeRole,
} from '@/server/utils';

const assignmentService = new AssignmentService();

/**
 * PATCH /api/municipality/assignments/[id] — Update assignment (approve/reject completion, update progress)
 */
export const PATCH = withErrorHandler(async (request, context) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'municipality', 'admin');

  const { id } = await context!.params;
  const body = await request.json();
  const data = validateBody(updateAssignmentSchema, body);

  const updated = await assignmentService.updateAssignment(id, data);
  return successResponse(updated, 'Assignment updated');
});
