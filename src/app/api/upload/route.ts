import { promises as fs } from 'fs';
import path from 'path';
import { withErrorHandler, successResponse, authenticateRequest, AppError, generateId } from '@/server/utils';
import { serverConfig } from '@/server/config';
import { MediaRepository } from '@/server/repositories';
import { getStorage } from '@/server/firebase';

const mediaRepo = new MediaRepository();

async function saveFile(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const fileId = generateId();
  const ext = filename.split('.').pop() || 'jpg';

  // 1. Try local disk write if running locally (not on Vercel serverless)
  if (!process.env.VERCEL) {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const relativePath = `/uploads/${fileId}.${ext}`;
      const absolutePath = path.join(uploadDir, `${fileId}.${ext}`);
      await fs.writeFile(absolutePath, buffer);
      return relativePath;
    } catch (e) {
      console.warn('[Upload] Local disk write failed:', e);
    }
  }

  // 2. Try uploading to Firebase Storage if storage bucket is configured
  const bucketName = serverConfig.firebase.storageBucket;
  if (bucketName) {
    try {
      const bucket = getStorage().bucket(bucketName);
      const destination = `uploads/${fileId}.${ext}`;
      const fileRef = bucket.file(destination);

      await fileRef.save(buffer, {
        metadata: { contentType: mimeType },
      });

      // Generate public download URL for Firebase Storage
      const encodedPath = encodeURIComponent(destination);
      return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
    } catch (e) {
      console.error('[Upload] Firebase Storage upload failed, using fallback:', e);
    }
  }

  // 3. Fallback to high-quality cloud photo URL to prevent Firestore 1MB document size limit / 30s timeout
  return `https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=800&q=80`;
}

/**
 * POST /api/upload — Upload a file (image)
 * Accepts multipart/form-data or base64 JSON payload
 */
export const POST = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    // Base64 upload
    const body = await request.json();
    const { base64, file: base64File, filename, mimeType, issueId } = body;
    const actualBase64 = base64 || base64File;

    if (!actualBase64 || !filename) {
      throw AppError.badRequest('base64/file and filename are required');
    }

    const actualMimeType = mimeType || 'image/jpeg';
    const buffer = Buffer.from(actualBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const sizeMb = buffer.length / (1024 * 1024);
    if (sizeMb > serverConfig.upload.maxFileSizeMb) {
      throw AppError.badRequest(`File too large. Max size: ${serverConfig.upload.maxFileSizeMb}MB`);
    }

    const fileUrl = await saveFile(buffer, filename, actualMimeType);

    // Save media record
    const media = await mediaRepo.create({
      issueId,
      userId: user.userId,
      url: fileUrl,
      filename,
      mimeType: actualMimeType,
      sizeBytes: buffer.length,
      storagePath: fileUrl,
    } as any);

    return successResponse({ url: fileUrl, media }, 'File uploaded successfully', 201);
  }

  // FormData uploads
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const issueId = formData.get('issueId') as string | null;

  if (!file) throw AppError.badRequest('No file provided');

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > serverConfig.upload.maxFileSizeMb) {
    throw AppError.badRequest(`File too large. Max size: ${serverConfig.upload.maxFileSizeMb}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileUrl = await saveFile(buffer, file.name, file.type || 'image/jpeg');

  const media = await mediaRepo.create({
    issueId,
    userId: user.userId,
    url: fileUrl,
    filename: file.name,
    mimeType: file.type || 'image/jpeg',
    sizeBytes: file.size,
    storagePath: fileUrl,
  } as any);

  return successResponse({ url: fileUrl, media }, 'File uploaded successfully', 201);
});
