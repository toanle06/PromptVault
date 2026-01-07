import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';
import imageCompression from 'browser-image-compression';

// Get storage instance with validation
function getStorageInstance() {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Check your Firebase configuration.');
  }
  return storage;
}

// Generate unique filename
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}_${randomStr}.${extension}`;
}

// Get storage path for attachment
export function getAttachmentPath(
  userId: string,
  promptId: string,
  attachmentId: string,
  fileName: string
): string {
  return `users/${userId}/prompts/${promptId}/attachments/${attachmentId}/${fileName}`;
}

// Get thumbnail path
export function getThumbnailPath(
  userId: string,
  promptId: string,
  attachmentId: string,
  fileName: string
): string {
  return `users/${userId}/prompts/${promptId}/attachments/${attachmentId}/thumb_${fileName}`;
}

// Compress image for thumbnail
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.1, // 100KB max for thumbnails
    maxWidthOrHeight: 400,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return file;
  }
}

// Upload file with progress tracking
export async function uploadFile(
  userId: string,
  promptId: string,
  attachmentId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; thumbnailUrl?: string }> {
  const storageInstance = getStorageInstance();
  const fileName = generateFileName(file.name);

  // Upload main file
  const mainPath = getAttachmentPath(userId, promptId, attachmentId, fileName);
  const mainRef = ref(storageInstance, mainPath);

  const uploadTask = uploadBytesResumable(mainRef, file);

  // Track progress
  if (onProgress) {
    uploadTask.on('state_changed', (snapshot: UploadTaskSnapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    });
  }

  // Wait for upload to complete
  await uploadTask;
  const url = await getDownloadURL(mainRef);

  // Upload thumbnail for images
  let thumbnailUrl: string | undefined;
  if (file.type.startsWith('image/')) {
    try {
      const thumbnailFile = await compressImage(file);
      const thumbPath = getThumbnailPath(userId, promptId, attachmentId, fileName);
      const thumbRef = ref(storageInstance, thumbPath);
      await uploadBytesResumable(thumbRef, thumbnailFile);
      thumbnailUrl = await getDownloadURL(thumbRef);
    } catch (error) {
      console.warn('Thumbnail upload failed:', error);
    }
  }

  return { url, thumbnailUrl };
}

// Delete file from storage
export async function deleteFile(path: string): Promise<void> {
  const storageInstance = getStorageInstance();
  const fileRef = ref(storageInstance, path);

  try {
    await deleteObject(fileRef);
  } catch (error: unknown) {
    // Ignore if file doesn't exist
    if (error instanceof Error && error.message.includes('object-not-found')) {
      return;
    }
    throw error;
  }
}

// Delete attachment files (main + thumbnail)
export async function deleteAttachmentFiles(
  userId: string,
  promptId: string,
  attachmentId: string,
  fileName: string
): Promise<void> {
  const mainPath = getAttachmentPath(userId, promptId, attachmentId, fileName);
  const thumbPath = getThumbnailPath(userId, promptId, attachmentId, fileName);

  await Promise.all([
    deleteFile(mainPath),
    deleteFile(thumbPath),
  ]);
}

// Get download URL for a path
export async function getFileDownloadURL(path: string): Promise<string> {
  const storageInstance = getStorageInstance();
  const fileRef = ref(storageInstance, path);
  return getDownloadURL(fileRef);
}
