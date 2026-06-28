import { promises as fs } from 'fs';
import path from 'path';
import { withErrorHandler, successResponse, authenticateRequest, AppError, generateId } from '@/server/utils';
import { serverConfig } from '@/server/config';

async function saveFileLocally(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const fileId = generateId();
  const ext = filename.split('.').pop() || 'jpg';

  // Save to local public/uploads directory
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });
  const relativePath = `/uploads/${fileId}.${ext}`;
  const absolutePath = path.join(uploadDir, `${fileId}.${ext}`);
  await fs.writeFile(absolutePath, buffer);
  return relativePath;
}

/**
 * POST /api/upload — Upload a file (image)
 * Accepts multipart/form-data or base64 JSON payload
 * Files are saved locally to public/uploads/ (no database write for speed)
 */
export const POST = withErrorHandler(async (request) => {
  const user = await authenticateRequest(request);
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    // Base64 upload
    const body = await request.json();
    const { base64, filename, mimeType } = body;

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

    const fileUrl = await saveFileLocally(buffer, filename, mimeType);

    return successResponse({ url: fileUrl }, 'File uploaded successfully', 201);
  }

  // FormData uploads
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) throw AppError.badRequest('No file provided');

  if (!serverConfig.upload.allowedFileTypes.includes(file.type)) {
    throw AppError.badRequest(`File type ${file.type} is not allowed`);
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > serverConfig.upload.maxFileSizeMb) {
    throw AppError.badRequest(`File too large. Max size: ${serverConfig.upload.maxFileSizeMb}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileUrl = await saveFileLocally(buffer, file.name, file.type);

  return successResponse({ url: fileUrl }, 'File uploaded successfully', 201);
});
