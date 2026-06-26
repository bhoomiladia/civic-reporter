// ============================================
// Server-side Configuration
// ============================================

export const serverConfig = {
  env: process.env.NODE_ENV || 'development',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    databaseUrl: process.env.FIREBASE_DATABASE_URL || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    maxFilesPerUpload: parseInt(process.env.MAX_FILES_PER_UPLOAD || '5', 10),
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
  },

  nominatim: {
    baseUrl: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
    userAgent: process.env.NOMINATIM_USER_AGENT || 'CIVICReporter/1.0',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
} as const;

export type ServerConfig = typeof serverConfig;
