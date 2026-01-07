import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MAX_ATTACHMENTS_PER_PROMPT } from '@/types';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// Validate single file
export function validateFile(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.map(t => t.split('/')[1]).join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)}. Please choose a smaller file.`,
    };
  }

  return { valid: true };
}

// Validate multiple files
export function validateFiles(
  files: File[],
  currentCount: number = 0
): FileValidationResult {
  // Check max attachments limit
  if (currentCount + files.length > MAX_ATTACHMENTS_PER_PROMPT) {
    return {
      valid: false,
      error: `Maximum ${MAX_ATTACHMENTS_PER_PROMPT} attachments allowed per prompt.`,
    };
  }

  // Validate each file
  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

// Get file type category
export function getFileType(mimeType: string): 'image' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) {
    return 'document';
  }
  return 'other';
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Get file extension
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

// Check if file is an image
export function isImageFile(file: File | string): boolean {
  if (typeof file === 'string') {
    const ext = getFileExtension(file);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  }
  return file.type.startsWith('image/');
}

// Generate a unique ID for attachments
export function generateAttachmentId(): string {
  return `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get accepted file types string for input accept attribute
export function getAcceptedFileTypes(): string {
  return ALLOWED_FILE_TYPES.join(',');
}
