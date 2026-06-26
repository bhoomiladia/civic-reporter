import { ISSUE_CATEGORIES } from '@/server/constants';
import { withErrorHandler, successResponse } from '@/server/utils';

/**
 * GET /api/categories — Get all issue categories
 */
export const GET = withErrorHandler(async () => {
  const categories = Object.entries(ISSUE_CATEGORIES).map(([id, def]) => ({
    id,
    ...def,
  }));
  return successResponse(categories);
});
