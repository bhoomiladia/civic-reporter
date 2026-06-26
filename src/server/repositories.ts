import { getDb, Collections } from './firebase';
import { generateId, calculateDistance, getBoundingBox } from './utils';
import type {
  BaseDocument, IUser, IIssue, IIssueFilter, IComment, IVote,
  IAssignment, INotification, IAuditLog, ISession, IMedia,
  ITimelineEvent, IWorker, IMunicipality,
} from './interfaces';
import type { IssueStatus } from './types';

// ============================================
// Base Repository
// ============================================

class BaseRepository<T extends BaseDocument> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected get collection() {
    return getDb().collection(this.collectionName);
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  async findAll(
    limit = 20, offset = 0,
    orderBy = 'createdAt',
    direction: FirebaseFirestore.OrderByDirection = 'desc'
  ): Promise<{ data: T[]; total: number }> {
    const countSnap = await this.collection.count().get();
    const total = countSnap.data().count;
    const snap = await this.collection.orderBy(orderBy, direction).offset(offset).limit(limit).get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    return { data, total };
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, customId?: string): Promise<T> {
    const id = customId || generateId();
    const now = new Date();
    const doc = { ...data, id, createdAt: now, updatedAt: now };
    await this.collection.doc(id).set(doc);
    return doc as unknown as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const ref = this.collection.doc(id);
    const existing = await ref.get();
    if (!existing.exists) return null;
    await ref.update({ ...data, updatedAt: new Date() } as Record<string, unknown>);
    const updated = await ref.get();
    return { id: updated.id, ...updated.data() } as T;
  }

  async delete(id: string): Promise<boolean> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return false;
    await this.collection.doc(id).delete();
    return true;
  }

  async findByField(field: string, value: unknown): Promise<T[]> {
    const snap = await this.collection.where(field, '==', value).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  }

  async findOneByField(field: string, value: unknown): Promise<T | null> {
    const snap = await this.collection.where(field, '==', value).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  }

  async countByField(field: string, value: unknown): Promise<number> {
    const snap = await this.collection.where(field, '==', value).count().get();
    return snap.data().count;
  }

  async exists(id: string): Promise<boolean> {
    return (await this.collection.doc(id).get()).exists;
  }

  async increment(id: string, field: string, value: number): Promise<void> {
    const { FieldValue } = await import('firebase-admin/firestore');
    await this.collection.doc(id).update({
      [field]: FieldValue.increment(value),
      updatedAt: new Date(),
    });
  }
}

// ============================================
// User Repository
// ============================================

export class UserRepository extends BaseRepository<IUser> {
  constructor() { super(Collections.USERS); }

  async findByEmail(email: string) { return this.findOneByField('email', email); }
  async findByFirebaseUid(uid: string) { return this.findOneByField('firebaseUid', uid); }

  async findByRole(role: string, limit = 50): Promise<IUser[]> {
    const snap = await this.collection
      .where('role', '==', role).where('isActive', '==', true)
      .orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IUser));
  }

  async findActiveUsers(limit = 20, offset = 0): Promise<{ data: IUser[]; total: number }> {
    const countSnap = await this.collection
      .where('isActive', '==', true).where('isBanned', '==', false).count().get();
    const total = countSnap.data().count;
    const snap = await this.collection
      .where('isActive', '==', true).where('isBanned', '==', false)
      .orderBy('createdAt', 'desc').offset(offset).limit(limit).get();
    return { data: snap.docs.map((d) => ({ id: d.id, ...d.data() } as IUser)), total };
  }

  async banUser(id: string, reason: string) {
    return this.update(id, { isBanned: true, banReason: reason, isActive: false } as Partial<IUser>);
  }

  async unbanUser(id: string) {
    return this.update(id, { isBanned: false, banReason: undefined, isActive: true } as Partial<IUser>);
  }

  async getTopContributors(limit = 10): Promise<IUser[]> {
    const snap = await this.collection
      .where('isActive', '==', true).orderBy('issuesReported', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IUser));
  }

  async updateLoginTimestamp(id: string) {
    await this.collection.doc(id).update({ lastLoginAt: new Date(), updatedAt: new Date() });
  }

  async incrementIssueCount(userId: string, field: 'issuesReported' | 'issuesResolved', value = 1) {
    await this.increment(userId, field, value);
  }

  async searchUsers(query: string, limit = 20): Promise<IUser[]> {
    const snap = await this.collection
      .where('name', '>=', query).where('name', '<=', query + '\uf8ff').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IUser));
  }
}

// ============================================
// Issue Repository
// ============================================

export class IssueRepository extends BaseRepository<IIssue> {
  constructor() { super(Collections.ISSUES); }

  async findWithFilters(
    filters: IIssueFilter, limit = 20, offset = 0,
    sortBy = 'createdAt', sortOrder: FirebaseFirestore.OrderByDirection = 'desc'
  ): Promise<{ data: IIssue[]; total: number }> {
    let query: FirebaseFirestore.Query = this.collection;

    if (filters.category?.length && filters.category.length <= 10) {
      query = query.where('category', 'in', filters.category);
    }
    if (filters.status?.length && filters.status.length <= 10) {
      query = query.where('status', 'in', filters.status);
    }
    if (filters.reportedBy) query = query.where('reportedBy', '==', filters.reportedBy);
    if (filters.assignedTo) query = query.where('assignedTo', '==', filters.assignedTo);
    if (filters.assignedMunicipality) query = query.where('assignedMunicipality', '==', filters.assignedMunicipality);
    if (filters.isVerified !== undefined) query = query.where('isVerified', '==', filters.isVerified);
    if (filters.dateFrom) query = query.where('createdAt', '>=', filters.dateFrom);
    if (filters.dateTo) query = query.where('createdAt', '<=', filters.dateTo);

    const countSnap = await query.count().get();
    const total = countSnap.data().count;
    const snap = await query.orderBy(sortBy, sortOrder).offset(offset).limit(limit).get();
    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as IIssue));

    // Client-side text search (Firestore has no full-text search)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter((i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.address.toLowerCase().includes(q) ||
        (i.location.neighborhood?.toLowerCase().includes(q) ?? false)
      );
    }

    return { data, total };
  }

  async findNearby(lat: number, lng: number, radiusKm = 5, limit = 50): Promise<IIssue[]> {
    const bounds = getBoundingBox(lat, lng, radiusKm);
    const snap = await this.collection
      .where('location.lat', '>=', bounds.minLat)
      .where('location.lat', '<=', bounds.maxLat)
      .limit(limit * 2).get();

    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as IIssue))
      .filter((i) => {
        const dist = calculateDistance(lat, lng, i.location.lat, i.location.lng);
        return dist <= radiusKm && i.location.lng >= bounds.minLng && i.location.lng <= bounds.maxLng;
      })
      .sort((a, b) =>
        calculateDistance(lat, lng, a.location.lat, a.location.lng) -
        calculateDistance(lat, lng, b.location.lat, b.location.lng)
      )
      .slice(0, limit);
  }

  async findByUser(userId: string, limit = 50): Promise<IIssue[]> {
    const snap = await this.collection
      .where('reportedBy', '==', userId).orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IIssue));
  }

  async findByStatus(status: IssueStatus, limit = 50): Promise<IIssue[]> {
    const snap = await this.collection
      .where('status', '==', status).orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IIssue));
  }

  async findTrending(limit = 10): Promise<IIssue[]> {
    const snap = await this.collection
      .where('status', 'in', ['reported', 'acknowledged', 'in_progress'])
      .orderBy('upvotes', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IIssue));
  }

  async updateStatus(id: string, status: IssueStatus, extra?: Partial<IIssue>): Promise<IIssue | null> {
    const upd: Partial<IIssue> = { status, ...extra };
    if (status === 'resolved') upd.resolvedAt = new Date();
    else if (status === 'closed') upd.closedAt = new Date();
    return this.update(id, upd);
  }

  async getStats() {
    const snap = await this.collection.get();
    const issues = snap.docs.map((d) => d.data() as IIssue);
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    for (const i of issues) {
      byCategory[i.category] = (byCategory[i.category] || 0) + 1;
      byStatus[i.status] = (byStatus[i.status] || 0) + 1;
      byPriority[i.priority] = (byPriority[i.priority] || 0) + 1;
    }
    return { byCategory, byStatus, byPriority, total: issues.length };
  }

  async getRecentlyResolved(limit = 10): Promise<IIssue[]> {
    const snap = await this.collection
      .where('status', '==', 'resolved').orderBy('resolvedAt', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IIssue));
  }

  async incrementVote(id: string, type: 'upvote' | 'downvote') {
    await this.increment(id, type === 'upvote' ? 'upvotes' : 'downvotes', 1);
  }
  async decrementVote(id: string, type: 'upvote' | 'downvote') {
    await this.increment(id, type === 'upvote' ? 'upvotes' : 'downvotes', -1);
  }
  async incrementCommentCount(id: string) { await this.increment(id, 'commentCount', 1); }
  async decrementCommentCount(id: string) { await this.increment(id, 'commentCount', -1); }
  async incrementVerificationCount(id: string) { await this.increment(id, 'verificationCount', 1); }
  async incrementReportCount(id: string) { await this.increment(id, 'reportCount', 1); }
}

// ============================================
// Comment Repository
// ============================================

export class CommentRepository extends BaseRepository<IComment> {
  constructor() { super(Collections.COMMENTS); }

  async findByIssue(issueId: string, limit = 50): Promise<IComment[]> {
    const snap = await this.collection
      .where('issueId', '==', issueId).orderBy('createdAt', 'asc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IComment));
  }

  async findReplies(parentId: string): Promise<IComment[]> {
    const snap = await this.collection
      .where('parentId', '==', parentId).orderBy('createdAt', 'asc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IComment));
  }

  async deleteByIssue(issueId: string): Promise<void> {
    const snap = await this.collection.where('issueId', '==', issueId).get();
    const db = getDb();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

// ============================================
// Vote Repository
// ============================================

export class VoteRepository extends BaseRepository<IVote> {
  constructor() { super(Collections.VOTES); }

  async findByIssueAndUser(issueId: string, userId: string): Promise<IVote | null> {
    const snap = await this.collection
      .where('issueId', '==', issueId).where('userId', '==', userId).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as IVote;
  }
}

// ============================================
// Assignment Repository
// ============================================

export class AssignmentRepository extends BaseRepository<IAssignment> {
  constructor() { super(Collections.ASSIGNMENTS); }

  async findByIssue(issueId: string): Promise<IAssignment[]> {
    const snap = await this.collection
      .where('issueId', '==', issueId).orderBy('createdAt', 'desc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IAssignment));
  }

  async findByWorker(workerId: string, status?: string): Promise<IAssignment[]> {
    let query: FirebaseFirestore.Query = this.collection.where('workerId', '==', workerId);
    if (status) query = query.where('status', '==', status);
    const snap = await query.orderBy('createdAt', 'desc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IAssignment));
  }

  async findByMunicipality(municipalityId: string): Promise<IAssignment[]> {
    const snap = await this.collection
      .where('municipalityId', '==', municipalityId).orderBy('createdAt', 'desc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IAssignment));
  }
}

// ============================================
// Notification Repository
// ============================================

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() { super(Collections.NOTIFICATIONS); }

  async findByUser(userId: string, limit = 50, unreadOnly = false): Promise<INotification[]> {
    let query: FirebaseFirestore.Query = this.collection.where('userId', '==', userId);
    if (unreadOnly) query = query.where('isRead', '==', false);
    const snap = await query.orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as INotification));
  }

  async markAsRead(id: string) {
    await this.collection.doc(id).update({ isRead: true, readAt: new Date(), updatedAt: new Date() });
  }

  async markAllAsRead(userId: string) {
    const snap = await this.collection
      .where('userId', '==', userId).where('isRead', '==', false).get();
    const db = getDb();
    const batch = db.batch();
    const now = new Date();
    snap.docs.forEach((d) => batch.update(d.ref, { isRead: true, readAt: now, updatedAt: now }));
    await batch.commit();
  }

  async countUnread(userId: string): Promise<number> {
    const snap = await this.collection
      .where('userId', '==', userId).where('isRead', '==', false).count().get();
    return snap.data().count;
  }
}

// ============================================
// Timeline Event Repository
// ============================================

export class TimelineEventRepository extends BaseRepository<ITimelineEvent> {
  constructor() { super(Collections.ISSUE_HISTORY); }

  async findByIssue(issueId: string): Promise<ITimelineEvent[]> {
    const snap = await this.collection
      .where('issueId', '==', issueId).orderBy('createdAt', 'asc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ITimelineEvent));
  }

  async getRecentActivity(limit = 20): Promise<ITimelineEvent[]> {
    const snap = await this.collection.orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ITimelineEvent));
  }
}

// ============================================
// Audit Log Repository
// ============================================

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() { super(Collections.AUDIT_LOGS); }

  async findByUser(userId: string, limit = 50): Promise<IAuditLog[]> {
    const snap = await this.collection
      .where('userId', '==', userId).orderBy('createdAt', 'desc').limit(limit).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IAuditLog));
  }

  async findByTarget(targetType: string, targetId: string): Promise<IAuditLog[]> {
    const snap = await this.collection
      .where('targetType', '==', targetType).where('targetId', '==', targetId)
      .orderBy('createdAt', 'desc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IAuditLog));
  }
}

// ============================================
// Session Repository
// ============================================

export class SessionRepository extends BaseRepository<ISession> {
  constructor() { super(Collections.SESSIONS); }

  async findByRefreshToken(token: string) { return this.findOneByField('refreshToken', token); }

  async revokeByToken(token: string) {
    const session = await this.findByRefreshToken(token);
    if (session) await this.update(session.id, { isRevoked: true } as Partial<ISession>);
  }

  async revokeAllForUser(userId: string) {
    const snap = await this.collection
      .where('userId', '==', userId).where('isRevoked', '==', false).get();
    const db = getDb();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { isRevoked: true, updatedAt: new Date() }));
    await batch.commit();
  }
}

// ============================================
// Worker Repository
// ============================================

export class WorkerRepository extends BaseRepository<IWorker> {
  constructor() { super(Collections.WORKERS); }

  async findByUserId(userId: string) { return this.findOneByField('userId', userId); }

  async findAvailable(municipalityId: string): Promise<IWorker[]> {
    const snap = await this.collection
      .where('municipalityId', '==', municipalityId).where('isAvailable', '==', true).get();
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as IWorker))
      .filter((w) => w.currentAssignments < w.maxAssignments);
  }

  async findByMunicipality(municipalityId: string): Promise<IWorker[]> {
    const snap = await this.collection
      .where('municipalityId', '==', municipalityId).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as IWorker));
  }
}

// ============================================
// Municipality Repository
// ============================================

export class MunicipalityRepository extends BaseRepository<IMunicipality> {
  constructor() { super(Collections.MUNICIPALITIES); }
  async findByCode(code: string) { return this.findOneByField('code', code); }
  async findActive(): Promise<IMunicipality[]> { return this.findByField('isActive', true); }
}

// ============================================
// Media Repository
// ============================================

export class MediaRepository extends BaseRepository<IMedia> {
  constructor() { super(Collections.MEDIA); }
  async findByIssue(issueId: string) { return this.findByField('issueId', issueId); }
  async findByUser(userId: string) { return this.findByField('userId', userId); }
}
