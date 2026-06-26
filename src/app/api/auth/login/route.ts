import { AuthService } from '@/server/services';
import { validateBody, loginSchema } from '@/server/validators';
import { withErrorHandler, successResponse } from '@/server/utils';

const authService = new AuthService();

/**
 * POST /api/auth/login
 */
export const POST = withErrorHandler(async (request) => {
  const body = await request.json();
  const { firebaseToken } = validateBody(loginSchema, body);

  const ip = request.headers.get('x-forwarded-for') || undefined;
  const ua = request.headers.get('user-agent') || undefined;

  const result = await authService.login(firebaseToken, ip, ua);

  return successResponse({
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  }, 'Login successful');
});
