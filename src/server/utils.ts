import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serverConfig } from './config';
import { EARTH_RADIUS_KM, USER_ROLES } from './constants';
import type { ApiResponse, DecodedToken, UserRole } from './types';

// ============================================
// ID Generation
// ============================================

export function generateId(): string {
  return uuidv4();
}

export function generateIssueId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `ISS-${timestamp}-${random}`;
}

// ============================================
// Geo Utilities
// ============================================

export function calculateDistance(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRadians(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos(toRadians(lat)));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

// ============================================
// Pagination
// ============================================

export function parsePagination(
  searchParams: URLSearchParams
): { page: number; limit: number; offset: number; sortBy: string; sortOrder: 'asc' | 'desc' } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
  return { page, limit, offset: (page - 1) * limit, sortBy, sortOrder };
}

// ============================================
// Response Helpers (Next.js)
// ============================================

export function successResponse<T>(data?: T, message?: string, status: number = 200): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
    meta: { timestamp: new Date().toISOString(), version: 'v1' },
  };
  return NextResponse.json(body, { status });
}

export function paginatedResponse<T>(
  data: T[], total: number, page: number, limit: number
): NextResponse {
  const totalPages = Math.ceil(total / limit);
  return NextResponse.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    meta: { timestamp: new Date().toISOString(), version: 'v1' },
  });
}

export function errorResponse(
  statusCode: number, code: string, message: string, details?: unknown
): NextResponse {
  const body: ApiResponse = {
    success: false,
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString(), version: 'v1' },
  };
  return NextResponse.json(body, { status: statusCode });
}

// ============================================
// Error Class
// ============================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(msg: string, details?: unknown) { return new AppError(msg, 400, 'BAD_REQUEST', details); }
  static unauthorized(msg = 'Unauthorized') { return new AppError(msg, 401, 'UNAUTHORIZED'); }
  static forbidden(msg = 'Forbidden') { return new AppError(msg, 403, 'FORBIDDEN'); }
  static notFound(resource = 'Resource') { return new AppError(`${resource} not found`, 404, 'NOT_FOUND'); }
  static conflict(msg: string) { return new AppError(msg, 409, 'CONFLICT'); }
  static validation(msg: string, details?: unknown) { return new AppError(msg, 422, 'VALIDATION_ERROR', details); }
}

// ============================================
// Auth Helpers for API Routes
// ============================================

export async function authenticateRequest(
  request: Request
): Promise<DecodedToken> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('No token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, serverConfig.jwt.secret) as DecodedToken;
    if (decoded.type !== 'access') throw AppError.unauthorized('Invalid token type');
    return decoded;
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}

export function authorizeRole(user: DecodedToken, ...allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw AppError.forbidden('Insufficient permissions');
  }
}

export function authorizeMinLevel(user: DecodedToken, minRole: UserRole): void {
  const userLevel = USER_ROLES[user.role]?.level ?? 0;
  const requiredLevel = USER_ROLES[minRole]?.level ?? 0;
  if (userLevel < requiredLevel) {
    throw AppError.forbidden('Insufficient permission level');
  }
}

// ============================================
// Route Handler Wrapper
// ============================================

type RouteHandler = (
  request: Request,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

/**
 * Wraps a Next.js route handler with automatic error handling
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return errorResponse(error.statusCode, error.code, error.message, error.details);
      }
      // Handle validation errors from validators.ts
      const err = error as Error & { statusCode?: number; code?: string; details?: unknown };
      if (err.statusCode && err.code) {
        return errorResponse(err.statusCode, err.code, err.message, err.details);
      }
      console.error('[API Error]', error);
      return errorResponse(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
    }
  };
}

// ============================================
// Misc Utilities
// ============================================

export function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
}

export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
