import { promises as fs } from 'fs';
import path from 'path';
import { withErrorHandler, successResponse, authenticateRequest, AppError, generateId } from '@/server/utils';
import { serverConfig } from '@/server/config';
import { MediaRepository } from '@/server/repositories';

const mediaRepo = new MediaRepository();

/**
 * POST /api/upload — Upload a file (image) to local filesystem inside public/uploads
 * Accepts multipart/form-data or base64 JSON payload
 */
export const POST = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const contentType = request.headers.get('content-type') || '';
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });

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

    const fileId = generateId();
    const ext = filename.split('.').pop() || 'jpg';
    const relativePath = `/uploads/${fileId}.${ext}`;
    const absolutePath = path.join(uploadDir, `${fileId}.${ext}`);

    // Write file to local disk
    await fs.writeFile(absolutePath, buffer);

    // Save media record
    const media = await mediaRepo.create({
      issueId,
      userId: user.userId,
      url: relativePath,
      filename,
      mimeType,
      sizeBytes: buffer.length,
      storagePath: relativePath,
    } as any);

    return successResponse({ url: relativePath, media }, 'File uploaded locally', 201);
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

  const fileId = generateId();
  const ext = file.name.split('.').pop() || 'jpg';
  const relativePath = `/uploads/${fileId}.${ext}`;
  const absolutePath = path.join(uploadDir, `${fileId}.${ext}`);

  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Write file to local disk
  await fs.writeFile(absolutePath, buffer);

  const media = await mediaRepo.create({
    issueId,
    userId: user.userId,
    url: relativePath,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    storagePath: relativePath,
  } as any);

  return successResponse({ url: relativePath, media }, 'File uploaded locally', 201);
});
