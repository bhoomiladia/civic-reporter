import { AuthService } from '@/server/services';
import { validateBody, refreshTokenSchema } from '@/server/validators';
import { withErrorHandler, successResponse } from '@/server/utils';

const authService = new AuthService();

/**
 * POST /api/auth/refresh
 */
export const POST = withErrorHandler(async (request) => {
  const body = await request.json();
  const { refreshToken } = validateBody(refreshTokenSchema, body);

  const tokens = await authService.refreshToken(refreshToken);

  return successResponse(tokens, 'Token refreshed');
});
