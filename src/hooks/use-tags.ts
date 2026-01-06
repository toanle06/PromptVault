'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usePromptStore } from '@/store/prompt-store';
import {
  subscribeToTags,
  createTag as createTagFn,
  updateTag as updateTagFn,
  deleteTag as deleteTagFn,
  importTags as importTagsFn,
} from '@/lib/firebase/firestore';
import type { Tag } from '@/types';
import { toast } from 'sonner';

export function useTags() {
  const { user } = useAuthStore();
  const { tags, isLoadingTags, setTags, setLoadingTags, getTagById } = usePromptStore();

  // Subscribe to tags
  useEffect(() => {
    if (!user?.uid) {
      setTags([]);
      return;
    }

    setLoadingTags(true);
    const unsubscribe = subscribeToTags(user.uid, (newTags) => {
      setTags(newTags);
    });

    return () => unsubscribe();
  }, [user?.uid, setTags, setLoadingTags]);

  // Create tag
  const createTag = useCallback(
    async (data: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const id = await createTagFn(user.uid, data);
        toast.success('Tag created successfully');
        return id;
      } catch (error) {
        toast.error('Failed to create tag');
        throw error;
      }
    },
    [user?.uid]
  );

  // Update tag
  const updateTag = useCallback(
    async (tagId: string, data: Partial<Tag>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await updateTagFn(user.uid, tagId, data);
        toast.success('Tag updated successfully');
      } catch (error) {
        toast.error('Failed to update tag');
        throw error;
      }
    },
    [user?.uid]
  );

  // Delete tag
  const deleteTag = useCallback(
    async (tagId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await deleteTagFn(user.uid, tagId);
        toast.success('Tag deleted successfully');
      } catch (error) {
        toast.error('Failed to delete tag');
        throw error;
      }
    },
    [user?.uid]
  );

  // Import tags
  const importTags = useCallback(
    async (tagsData: Partial<Tag>[]) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await importTagsFn(user.uid, tagsData);
      } catch (error) {
        toast.error('Failed to import tags');
        throw error;
      }
    },
    [user?.uid]
  );

  return {
    tags,
    isLoading: isLoadingTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    importTags,
  };
}
