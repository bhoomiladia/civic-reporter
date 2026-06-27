import { promises as fs } from 'fs';
import path from 'path';
import { withErrorHandler, successResponse, authenticateRequest, AppError, generateId } from '@/server/utils';
import { serverConfig } from '@/server/config';
import { MediaRepository } from '@/server/repositories';

const mediaRepo = new MediaRepository();

async function saveFile(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const fileId = generateId();
  const ext = filename.split('.').pop() || 'jpg';

  // Try writing locally if not running on Vercel serverless
  if (!process.env.VERCEL) {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const relativePath = `/uploads/${fileId}.${ext}`;
      const absolutePath = path.join(uploadDir, `${fileId}.${ext}`);
      await fs.writeFile(absolutePath, buffer);
      return relativePath;
    } catch (e) {
      console.warn('[Upload] Local filesystem write failed, falling back to data URL:', e);
    }
  }

  // Fallback to Base64 Data URL for serverless production environment (Vercel read-only filesystem)
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
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
    const { base64, filename, mimeType, issueId } = body;

    if (!base64 || !filename || !mimeType) {
      throw AppError.badRequest('base64, filename, and mimeType are required');
    }

    if (!serverConfig.upload.allowedFileTypes.includes(mimeType)) {
      throw AppError.badRequest(`File type ${mimeType} is not allowed`);
    }

    const buffer = Buffer.from(base64, 'base64');
    const sizeMb = buffer.length / (1024 * 1024);
    if (sizeMb > serverConfig.upload.maxFileSizeMb) {
      throw AppError.badRequest(`File too large. Max size: ${serverConfig.upload.maxFileSizeMb}MB`);
    }

    const fileUrl = await saveFile(buffer, filename, mimeType);

    // Save media record
    const media = await mediaRepo.create({
      issueId,
      userId: user.userId,
      url: fileUrl,
      filename,
      mimeType,
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

  if (!serverConfig.upload.allowedFileTypes.includes(file.type)) {
    throw AppError.badRequest(`File type ${file.type} is not allowed`);
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > serverConfig.upload.maxFileSizeMb) {
    throw AppError.badRequest(`File too large. Max size: ${serverConfig.upload.maxFileSizeMb}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileUrl = await saveFile(buffer, file.name, file.type);

  const media = await mediaRepo.create({
    issueId,
    userId: user.userId,
    url: fileUrl,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    storagePath: fileUrl,
  } as any);

  return successResponse({ url: fileUrl, media }, 'File uploaded successfully', 201);
});
