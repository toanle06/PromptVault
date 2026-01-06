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
import {
  getDemoTags,
  createDemoTag,
  updateDemoTag,
  deleteDemoTag,
  initializeDemoData,
} from '@/lib/demo/demo-store';
import type { Tag } from '@/types';
import { toast } from 'sonner';

export function useTags() {
  const { user, isDemoMode } = useAuthStore();
  const { tags, isLoadingTags, setTags, setLoadingTags, getTagById } = usePromptStore();

  // Subscribe to tags (or load demo data)
  useEffect(() => {
    if (!user?.uid) {
      setTags([]);
      return;
    }

    // Demo mode - load from localStorage
    if (isDemoMode) {
      initializeDemoData();
      setTags(getDemoTags());
      setLoadingTags(false);
      return;
    }

    // Firebase mode
    setLoadingTags(true);
    const unsubscribe = subscribeToTags(user.uid, (newTags) => {
      setTags(newTags);
    });

    return () => unsubscribe();
  }, [user?.uid, isDemoMode, setTags, setLoadingTags]);

  // Create tag
  const createTag = useCallback(
    async (data: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        let id: string;
        if (isDemoMode) {
          id = createDemoTag(data);
          setTags(getDemoTags());
        } else {
          id = await createTagFn(user.uid, data);
        }
        toast.success('Tag created successfully');
        return id;
      } catch (error) {
        toast.error('Failed to create tag');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setTags]
  );

  // Update tag
  const updateTag = useCallback(
    async (tagId: string, data: Partial<Tag>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          updateDemoTag(tagId, data);
          setTags(getDemoTags());
        } else {
          await updateTagFn(user.uid, tagId, data);
        }
        toast.success('Tag updated successfully');
      } catch (error) {
        toast.error('Failed to update tag');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setTags]
  );

  // Delete tag
  const deleteTag = useCallback(
    async (tagId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          deleteDemoTag(tagId);
          setTags(getDemoTags());
        } else {
          await deleteTagFn(user.uid, tagId);
        }
        toast.success('Tag deleted successfully');
      } catch (error) {
        toast.error('Failed to delete tag');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setTags]
  );

  // Import tags
  const importTags = useCallback(
    async (tagsData: Partial<Tag>[]) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          tagsData.forEach(tag => {
            createDemoTag({
              name: tag.name || 'Untitled',
              color: tag.color || '#6366f1',
            });
          });
          setTags(getDemoTags());
        } else {
          await importTagsFn(user.uid, tagsData);
        }
      } catch (error) {
        toast.error('Failed to import tags');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setTags]
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
