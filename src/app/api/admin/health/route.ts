import { withErrorHandler, successResponse, authenticateRequest, authorizeRole } from '@/server/utils';

/**
 * GET /api/admin/health — System health check (admin)
 */
export const GET = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  authorizeRole(user, 'admin');

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    env: process.env.NODE_ENV || 'development',
  };

  return successResponse(health);
});
