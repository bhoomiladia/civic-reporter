import { AuthService } from '@/server/services';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const authService = new AuthService();

/**
 * POST /api/auth/logout
 */
export const POST = withErrorHandler(async (request) => {
  const body = await request.json();
  const { refreshToken } = body;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  return successResponse(null, 'Logged out successfully');
});
