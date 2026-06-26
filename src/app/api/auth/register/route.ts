import { AuthService } from '@/server/services';
import { validateBody, registerSchema, loginSchema, refreshTokenSchema } from '@/server/validators';
import { withErrorHandler, successResponse, authenticateRequest } from '@/server/utils';

const authService = new AuthService();

/**
 * POST /api/auth/register
 */
export const POST = withErrorHandler(async (request) => {
  const body = await request.json();
  const data = validateBody(registerSchema, body);

  const result = await authService.register(data);

  return successResponse(
    {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
    'Registration successful',
    201
  );
});
