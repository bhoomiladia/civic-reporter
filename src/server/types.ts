// ============================================
// Core Types — Backend
// ============================================

export type IssueStatus =
  | 'reported'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueSeverity = 'minor' | 'moderate' | 'major' | 'severe';

export type IssueCategory =
  | 'pothole'
  | 'streetlight'
  | 'graffiti'
  | 'water_leak'
  | 'sidewalk'
  | 'trash'
  | 'noise'
  | 'traffic_sign'
  | 'drainage'
  | 'park'
  | 'other';

export type UserRole = 'citizen' | 'municipality' | 'worker' | 'admin';

export type NotificationType =
  | 'status_update'
  | 'assignment'
  | 'comment'
  | 'vote'
  | 'system'
  | 'reminder';

export type AuditAction =
  | 'user_created'
  | 'user_updated'
  | 'user_banned'
  | 'user_unbanned'
  | 'issue_created'
  | 'issue_updated'
  | 'issue_deleted'
  | 'issue_status_changed'
  | 'issue_assigned'
  | 'comment_created'
  | 'comment_deleted'
  | 'vote_cast'
  | 'vote_removed'
  | 'worker_assigned'
  | 'worker_unassigned'
  | 'municipality_updated'
  | 'category_created'
  | 'category_updated'
  | 'media_uploaded'
  | 'media_deleted'
  | 'system_config_changed';

export type AssignmentStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export type TimelineEventType =
  | 'created'
  | 'acknowledged'
  | 'assigned'
  | 'updated'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'comment_added'
  | 'priority_changed'
  | 'status_changed';

// ============================================
// API Response
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

// ============================================
// Geolocation
// ============================================

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface GeoSearchResult {
  displayName: string;
  lat: number;
  lng: number;
  type: string;
  importance: number;
}

// ============================================
// JWT Token Payloads
// ============================================

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}
