'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import {
  getAttachments,
  createAttachmentWithId,
  deleteAttachment as deleteAttachmentFn,
  reorderAttachments as reorderAttachmentsFn,
  subscribeToAttachments,
} from '@/lib/firebase/firestore';
import {
  uploadFile,
  deleteAttachmentFiles,
} from '@/lib/firebase/storage';
import {
  validateFile,
  validateFiles,
  getFileType,
  generateAttachmentId,
} from '@/lib/utils/file-utils';
import type { PromptAttachment, AttachmentUploadProgress } from '@/types';

export function useAttachments(promptId: string | null) {
  const { user } = useAuthStore();
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<AttachmentUploadProgress[]>([]);

  // Subscribe to attachments when promptId changes
  useEffect(() => {
    if (!user?.uid || !promptId) {
      setAttachments([]);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToAttachments(user.uid, promptId, (newAttachments) => {
      setAttachments(newAttachments);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid, promptId]);

  // Load attachments manually
  const loadAttachments = useCallback(async () => {
    if (!user?.uid || !promptId) return;

    setIsLoading(true);
    try {
      const data = await getAttachments(user.uid, promptId);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
      toast.error('Failed to load attachments');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, promptId]);

  // Upload a single file
  const uploadAttachment = useCallback(
    async (file: File): Promise<PromptAttachment | null> => {
      if (!user?.uid || !promptId) {
        toast.error('User not authenticated');
        return null;
      }

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return null;
      }

      const attachmentId = generateAttachmentId();

      // Add to progress
      setUploadProgress((prev) => [
        ...prev,
        { fileName: file.name, progress: 0, status: 'uploading' },
      ]);

      try {
        // Upload file to storage
        const { url, thumbnailUrl } = await uploadFile(
          user.uid,
          promptId,
          attachmentId,
          file,
          (progress) => {
            setUploadProgress((prev) =>
              prev.map((p) =>
                p.fileName === file.name ? { ...p, progress } : p
              )
            );
          }
        );

        // Create attachment record in Firestore
        const attachmentData: Omit<PromptAttachment, 'id' | 'createdAt'> = {
          promptId,
          fileName: file.name.split('.').slice(0, -1).join('.') + '_' + Date.now() + '.' + file.name.split('.').pop(),
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url,
          thumbnailUrl,
          order: attachments.length,
          type: getFileType(file.type),
        };

        await createAttachmentWithId(user.uid, promptId, attachmentId, attachmentData);

        // Update progress to complete
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === file.name ? { ...p, progress: 100, status: 'complete' } : p
          )
        );

        toast.success(`${file.name} uploaded successfully`);

        // Return the created attachment
        return {
          id: attachmentId,
          ...attachmentData,
        } as PromptAttachment;
      } catch (error) {
        console.error('Upload failed:', error);

        // Update progress to error
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileName === file.name
              ? { ...p, status: 'error', error: 'Upload failed' }
              : p
          )
        );

        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    },
    [user?.uid, promptId, attachments.length]
  );

  // Upload multiple files
  const uploadAttachments = useCallback(
    async (files: File[]): Promise<PromptAttachment[]> => {
      if (!user?.uid || !promptId) {
        toast.error('User not authenticated');
        return [];
      }

      // Validate all files
      const validation = validateFiles(files, attachments.length);
      if (!validation.valid) {
        toast.error(validation.error);
        return [];
      }

      const uploaded: PromptAttachment[] = [];

      for (const file of files) {
        const attachment = await uploadAttachment(file);
        if (attachment) {
          uploaded.push(attachment);
        }
      }

      // Clear completed uploads after a delay
      setTimeout(() => {
        setUploadProgress((prev) =>
          prev.filter((p) => p.status === 'uploading')
        );
      }, 2000);

      return uploaded;
    },
    [user?.uid, promptId, attachments.length, uploadAttachment]
  );

  // Delete attachment
  const deleteAttachment = useCallback(
    async (attachmentId: string) => {
      if (!user?.uid || !promptId) {
        toast.error('User not authenticated');
        return;
      }

      const attachment = attachments.find((a) => a.id === attachmentId);
      if (!attachment) {
        toast.error('Attachment not found');
        return;
      }

      try {
        // Delete from storage
        await deleteAttachmentFiles(
          user.uid,
          promptId,
          attachmentId,
          attachment.fileName
        );

        // Delete from Firestore
        await deleteAttachmentFn(user.uid, promptId, attachmentId);

        toast.success('Attachment deleted');
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('Failed to delete attachment');
      }
    },
    [user?.uid, promptId, attachments]
  );

  // Reorder attachments
  const reorderAttachments = useCallback(
    async (orderedIds: string[]) => {
      if (!user?.uid || !promptId) {
        toast.error('User not authenticated');
        return;
      }

      try {
        await reorderAttachmentsFn(user.uid, promptId, orderedIds);
      } catch (error) {
        console.error('Reorder failed:', error);
        toast.error('Failed to reorder attachments');
      }
    },
    [user?.uid, promptId]
  );

  // Clear upload progress
  const clearUploadProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  return {
    attachments,
    isLoading,
    uploadProgress,
    loadAttachments,
    uploadAttachment,
    uploadAttachments,
    deleteAttachment,
    reorderAttachments,
    clearUploadProgress,
  };
}
