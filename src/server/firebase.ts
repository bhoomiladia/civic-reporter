import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth as getFirebaseAuth, type Auth } from 'firebase-admin/auth';
import { getStorage as getFirebaseStorage, type Storage } from 'firebase-admin/storage';
import { serverConfig } from './config';

let firebaseApp: App | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: Storage | undefined;

function initializeFirebase(): App {
  if (firebaseApp) return firebaseApp;

  try {
    const existingApps = getApps();
    firebaseApp = existingApps.length > 0
      ? existingApps[0]!
      : (() => {
          const { projectId, privateKey, clientEmail, storageBucket, databaseUrl } = serverConfig.firebase;
          if (projectId && privateKey && clientEmail) {
            return initializeApp({
              credential: cert({
                projectId,
                privateKey,
                clientEmail,
              }),
              storageBucket: storageBucket || undefined,
              databaseURL: databaseUrl || undefined,
            });
          } else {
            console.warn('[Firebase] Warning: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, or FIREBASE_CLIENT_EMAIL is missing in environment variables.');
            return initializeApp({
              projectId: projectId || 'civic-reporter-dev',
            });
          }
        })();

    return firebaseApp;
  } catch (error) {
    console.error('[Firebase] Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

export function getDb(): Firestore {
  if (!db) {
    const app = initializeFirebase();
    db = getFirestore(app);
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
      // Ignore in dev (Firestore might already be initialized from HMR)
    }
  }
  return db;
}

export function getAuth(): Auth {
  if (!auth) {
    const app = initializeFirebase();
    auth = getFirebaseAuth(app);
  }
  return auth;
}

export function getStorage(): Storage {
  if (!storage) {
    const app = initializeFirebase();
    storage = getFirebaseStorage(app);
  }
  return storage;
}

// ============================================
// Collection Names
// ============================================

export const Collections = {
  USERS: 'users',
  ISSUES: 'issues',
  COMMENTS: 'comments',
  VOTES: 'votes',
  ASSIGNMENTS: 'assignments',
  MUNICIPALITIES: 'municipalities',
  WORKERS: 'workers',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  SESSIONS: 'sessions',
  MEDIA: 'media',
  ISSUE_HISTORY: 'issue_history',
  CATEGORIES: 'categories',
  REPORTS: 'reports',
} as const;

export type CollectionName = (typeof Collections)[keyof typeof Collections];
