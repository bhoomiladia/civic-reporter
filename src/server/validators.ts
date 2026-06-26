import { z } from 'zod';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_COMMENT_LENGTH } from './constants';

// ============================================
// Common
// ============================================

export const geoLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1).max(500),
  neighborhood: z.string().max(200).optional(),
  city: z.string().max(200).optional(),
  state: z.string().max(200).optional(),
  country: z.string().max(200).optional(),
  postalCode: z.string().max(20).optional(),
});

// ============================================
// Auth
// ============================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2).max(100),
  firebaseToken: z.string().min(1, 'Firebase token is required'),
  role: z.enum(['citizen', 'municipality', 'worker', 'admin']).default('citizen'),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  firebaseToken: z.string().min(1, 'Firebase token is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================
// User
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  displayName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    emailAlerts: z.boolean().optional(),
    pushAlerts: z.boolean().optional(),
  }).optional(),
  location: geoLocationSchema.optional(),
});

// ============================================
// Issue
// ============================================

export const createIssueSchema = z.object({
  title: z.string().min(5).max(MAX_TITLE_LENGTH),
  description: z.string().min(10).max(MAX_DESCRIPTION_LENGTH),
  category: z.enum([
    'pothole', 'streetlight', 'graffiti', 'water_leak', 'sidewalk',
    'trash', 'noise', 'traffic_sign', 'drainage', 'park', 'other',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  severity: z.enum(['minor', 'moderate', 'major', 'severe']).optional(),
  location: geoLocationSchema,
  photos: z.array(z.string().url()).max(10).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(5).max(MAX_TITLE_LENGTH).optional(),
  description: z.string().min(10).max(MAX_DESCRIPTION_LENGTH).optional(),
  category: z.enum([
    'pothole', 'streetlight', 'graffiti', 'water_leak', 'sidewalk',
    'trash', 'noise', 'traffic_sign', 'drainage', 'park', 'other',
  ]).optional(),
  status: z.enum(['reported', 'acknowledged', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  severity: z.enum(['minor', 'moderate', 'major', 'severe']).optional(),
  location: geoLocationSchema.optional(),
  photos: z.array(z.string().url()).max(10).optional(),
  assignedTo: z.string().optional(),
  assignedMunicipality: z.string().optional(),
  estimatedResolution: z.coerce.date().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

// ============================================
// Comment
// ============================================

export const createCommentSchema = z.object({
  content: z.string().min(1).max(MAX_COMMENT_LENGTH),
  parentId: z.string().optional(),
});

// ============================================
// Vote
// ============================================

export const voteSchema = z.object({
  type: z.enum(['upvote', 'downvote']),
});

// ============================================
// Assignment
// ============================================

export const createAssignmentSchema = z.object({
  issueId: z.string().min(1),
  workerId: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

export const updateAssignmentSchema = z.object({
  status: z.enum(['pending', 'accepted', 'in_progress', 'completed', 'rejected']).optional(),
  notes: z.string().max(1000).optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  progressNotes: z.string().max(1000).optional(),
});

// ============================================
// GPS
// ============================================

export const gpsUpdateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// ============================================
// Admin
// ============================================

export const banUserSchema = z.object({
  reason: z.string().min(5).max(500),
});

// ============================================
// Geocoding
// ============================================

export const reverseGeocodeSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const forwardGeocodeSchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.coerce.number().int().positive().max(20).default(5),
});

// ============================================
// Validation Helper
// ============================================

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((e: z.ZodIssue) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    // Inline error throw to avoid circular imports
    const err = new Error('Validation failed') as Error & { statusCode: number; code: string; details: unknown };
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    err.details = details;
    throw err;
  }
  return result.data;
}
