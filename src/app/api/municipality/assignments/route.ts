import { AssignmentService } from '@/server/services';
import { validateBody, createAssignmentSchema } from '@/server/validators';
import {
  withErrorHandler, successResponse, authenticateRequest, authorizeRole,
} from '@/server/utils';

const assignmentService = new AssignmentService();

/**
 * GET /api/municipality/assignments — Get assignments for municipality
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'municipality', 'admin');

  const { searchParams } = new URL(request.url);
  const municipalityId = searchParams.get('municipalityId') || user.userId;

  const assignments = await assignmentService.getMunicipalityAssignments(municipalityId);
  return successResponse(assignments);
});

/**
 * POST /api/municipality/assignments — Assign worker to an issue
 */
export const POST = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'municipality', 'admin');

  const body = await request.json();
  const data = validateBody(createAssignmentSchema, body);
  const assignment = await assignmentService.assignWorker(user.userId, data);
  return successResponse(assignment, 'Worker assigned', 201);
});
