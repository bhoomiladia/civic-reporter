import type {
  IssueStatus, IssuePriority, IssueSeverity, IssueCategory,
  UserRole, GeoLocation, AssignmentStatus, TimelineEventType,
  NotificationType, AuditAction,
} from './types';

// ============================================
// Base Document
// ============================================

export interface BaseDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// User
// ============================================

export interface IUser extends BaseDocument {
  email: string;
  name: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  firebaseUid: string;
  issuesReported: number;
  issuesResolved: number;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  lastLoginAt?: Date;
  preferences: {
    notifications: boolean;
    emailAlerts: boolean;
    pushAlerts: boolean;
  };
  municipality?: string;
  location?: GeoLocation;
}

export interface IUserCreate {
  email: string;
  name: string;
  firebaseUid: string;
  role?: UserRole;
  avatar?: string;
  phone?: string;
}

export interface IUserUpdate {
  name?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  preferences?: Partial<IUser['preferences']>;
  location?: GeoLocation;
}

// ============================================
// Issue
// ============================================

export interface IIssue extends BaseDocument {
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  severity?: IssueSeverity;
  location: GeoLocation;
  photos: string[];
  reportedBy: string;
  reportedByName: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  assignedTo?: string;
  assignedMunicipality?: string;
  estimatedResolution?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  isVerified: boolean;
  verifiedBy?: string;
  verificationCount: number;
  reportCount: number;
  tags: string[];
}

export interface IIssueCreate {
  title: string;
  description: string;
  category: IssueCategory;
  priority?: IssuePriority;
  severity?: IssueSeverity;
  location: GeoLocation;
  photos?: string[];
  tags?: string[];
}

export interface IIssueUpdate {
  title?: string;
  description?: string;
  category?: IssueCategory;
  status?: IssueStatus;
  priority?: IssuePriority;
  severity?: IssueSeverity;
  location?: GeoLocation;
  photos?: string[];
  assignedTo?: string;
  assignedMunicipality?: string;
  estimatedResolution?: Date;
  tags?: string[];
}

export interface IIssueFilter {
  category?: IssueCategory[];
  status?: IssueStatus[];
  priority?: IssuePriority[];
  reportedBy?: string;
  assignedTo?: string;
  assignedMunicipality?: string;
  isVerified?: boolean;
  search?: string;
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

// ============================================
// Comment
// ============================================

export interface IComment extends BaseDocument {
  issueId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  isOfficial: boolean;
  parentId?: string;
  likes: number;
  isEdited: boolean;
}

export interface ICommentCreate {
  issueId: string;
  content: string;
  parentId?: string;
}

// ============================================
// Vote
// ============================================

export interface IVote extends BaseDocument {
  issueId: string;
  userId: string;
  type: 'upvote' | 'downvote';
}

// ============================================
// Assignment
// ============================================

export interface IAssignment extends BaseDocument {
  issueId: string;
  workerId: string;
  workerName: string;
  municipalityId: string;
  assignedBy: string;
  status: AssignmentStatus;
  notes?: string;
  startedAt?: Date;
  completedAt?: Date;
  progressPercent: number;
  progressPhotos: string[];
  progressNotes: string[];
  lastGpsLocation?: GeoLocation;
  lastGpsUpdateAt?: Date;
}

export interface IAssignmentCreate {
  issueId: string;
  workerId: string;
  notes?: string;
}

// ============================================
// Municipality
// ============================================

export interface IMunicipality extends BaseDocument {
  name: string;
  code: string;
  jurisdiction: GeoLocation[];
  adminUserIds: string[];
  workerUserIds: string[];
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  stats: {
    totalIssues: number;
    resolvedIssues: number;
    averageResponseHours: number;
    activeWorkers: number;
  };
}

// ============================================
// Worker
// ============================================

export interface IWorker extends BaseDocument {
  userId: string;
  municipalityId: string;
  name: string;
  skills: string[];
  isAvailable: boolean;
  currentAssignments: number;
  maxAssignments: number;
  totalCompleted: number;
  lastGpsLocation?: GeoLocation;
  lastGpsUpdateAt?: Date;
}

// ============================================
// Notification
// ============================================

export interface INotification extends BaseDocument {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  readAt?: Date;
  issueId?: string;
  senderId?: string;
}

// ============================================
// Timeline Event
// ============================================

export interface ITimelineEvent extends BaseDocument {
  issueId: string;
  type: TimelineEventType;
  description: string;
  actor?: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Audit Log
// ============================================

export interface IAuditLog extends BaseDocument {
  action: AuditAction;
  userId: string;
  userName: string;
  targetType: string;
  targetId: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// Session
// ============================================

export interface ISession extends BaseDocument {
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  isRevoked: boolean;
}

// ============================================
// Media
// ============================================

export interface IMedia extends BaseDocument {
  issueId?: string;
  userId: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
}

// ============================================
// Category Definition
// ============================================

export interface ICategoryDefinition extends BaseDocument {
  categoryId: IssueCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}
