'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usePromptStore } from '@/store/prompt-store';
import {
  subscribeToPrompts,
  createPrompt as createPromptFn,
  updatePrompt as updatePromptFn,
  deletePrompt as deletePromptFn,
  toggleFavorite as toggleFavoriteFn,
  incrementUsageCount as incrementUsageFn,
  importPrompts as importPromptsFn,
  // Sprint 1: New functions
  duplicatePrompt as duplicatePromptFn,
  togglePin as togglePinFn,
  softDeletePrompt as softDeletePromptFn,
  restorePrompt as restorePromptFn,
  permanentlyDeletePrompt as permanentlyDeletePromptFn,
  emptyTrash as emptyTrashFn,
  // Sprint 2: Version history & Bulk operations
  getPromptVersions as getPromptVersionsFn,
  restorePromptVersion as restorePromptVersionFn,
  bulkOperation as bulkOperationFn,
} from '@/lib/firebase/firestore';
import type { PromptFormData, Prompt, BulkAction, PromptVersion, BulkOperationResult } from '@/types';
import { toast } from 'sonner';

// Global subscription - persists across component mounts/unmounts
export function usePrompts() {
  const { user } = useAuthStore();
  const {
    prompts,
    isLoading,
    setPrompts,
    setLoading,
    getFilteredPrompts,
    filters,
    setFilters,
    clearFilters,
    sortOptions,
    setSortOptions,
    error,
    setError,
  } = usePromptStore();

  // Subscription is now handled by PromptSubscriptionManager in the layout
  // We just return the data from the store

  // Create prompt
  const createPrompt = useCallback(
    async (data: PromptFormData) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const id = await createPromptFn(user.uid, data);
        toast.success('Prompt created successfully');
        return id;
      } catch (error) {
        toast.error('Failed to create prompt');
        throw error;
      }
    },
    [user?.uid]
  );

  // Update prompt
  const updatePrompt = useCallback(
    async (promptId: string, data: Partial<PromptFormData>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await updatePromptFn(user.uid, promptId, data);
        toast.success('Prompt updated successfully');
      } catch (error) {
        toast.error('Failed to update prompt');
        throw error;
      }
    },
    [user?.uid]
  );

  // Delete prompt
  const deletePrompt = useCallback(
    async (promptId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await deletePromptFn(user.uid, promptId);
        toast.success('Prompt deleted successfully');
      } catch (error) {
        toast.error('Failed to delete prompt');
        throw error;
      }
    },
    [user?.uid]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (promptId: string, isFavorite: boolean) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await toggleFavoriteFn(user.uid, promptId, isFavorite);
        toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
      } catch (error) {
        toast.error('Failed to update favorite status');
        throw error;
      }
    },
    [user?.uid]
  );

  // Copy prompt and increment usage count
  const copyPrompt = useCallback(
    async (promptId: string, content: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await navigator.clipboard.writeText(content);
        await incrementUsageFn(user.uid, promptId);
        toast.success('Copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy prompt');
        throw error;
      }
    },
    [user?.uid]
  );

  // Get prompt by ID
  const getPromptById = useCallback(
    (promptId: string) => {
      return prompts.find((p) => p.id === promptId);
    },
    [prompts]
  );

  // Import prompts
  const importPrompts = useCallback(
    async (promptsData: Partial<Prompt>[]) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await importPromptsFn(user.uid, promptsData);
      } catch (error) {
        toast.error('Failed to import prompts');
        throw error;
      }
    },
    [user?.uid]
  );

  // ========================
  // SPRINT 1: NEW FEATURES
  // ========================

  // Duplicate prompt
  const duplicatePrompt = useCallback(
    async (promptId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const newId = await duplicatePromptFn(user.uid, promptId);
        toast.success('Prompt duplicated successfully');
        return newId;
      } catch (error) {
        toast.error('Failed to duplicate prompt');
        throw error;
      }
    },
    [user?.uid]
  );

  // Toggle pin
  const togglePin = useCallback(
    async (promptId: string, isPinned: boolean) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await togglePinFn(user.uid, promptId, isPinned);
        toast.success(isPinned ? 'Prompt pinned' : 'Prompt unpinned');
      } catch (error) {
        toast.error('Failed to update pin status');
        throw error;
      }
    },
    [user?.uid]
  );

  // Soft delete (move to trash)
  const softDeletePrompt = useCallback(
    async (promptId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await softDeletePromptFn(user.uid, promptId);
        toast.success('Prompt moved to trash');
      } catch (error) {
        toast.error('Failed to delete prompt');
        throw error;
      }
    },
    [user?.uid]
  );

  // Restore from trash
  const restorePrompt = useCallback(
    async (promptId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await restorePromptFn(user.uid, promptId);
        toast.success('Prompt restored');
      } catch (error) {
        toast.error('Failed to restore prompt');
        throw error;
      }
    },
    [user?.uid]
  );

  // Permanently delete
  const permanentlyDeletePrompt = useCallback(
    async (promptId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await permanentlyDeletePromptFn(user.uid, promptId);
        toast.success('Prompt permanently deleted');
      } catch (error) {
        toast.error('Failed to delete prompt');
        throw error;
      }
    },
    [user?.uid]
  );

  // Empty trash
  const emptyTrash = useCallback(
    async () => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const count = await emptyTrashFn(user.uid);
        toast.success(`Deleted ${count} prompts from trash`);
        return count;
      } catch (error) {
        toast.error('Failed to empty trash');
        throw error;
      }
    },
    [user?.uid]
  );

  // Get active prompts (not deleted)
  const getActivePrompts = useCallback(() => {
    return prompts.filter((p) => !p.isDeleted);
  }, [prompts]);

  // Get deleted prompts (trash)
  const getDeletedPrompts = useCallback(() => {
    return prompts.filter((p) => p.isDeleted);
  }, [prompts]);

  // Get pinned prompts
  const getPinnedPrompts = useCallback(() => {
    return prompts.filter((p) => p.isPinned && !p.isDeleted);
  }, [prompts]);

  // ========================
  // SPRINT 2: NEW FEATURES
  // ========================

  // Get prompt versions
  const getPromptVersions = useCallback(
    async (promptId: string): Promise<PromptVersion[]> => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        return await getPromptVersionsFn(user.uid, promptId);
      } catch (error) {
        toast.error('Failed to fetch versions');
        throw error;
      }
    },
    [user?.uid]
  );

  // Restore a prompt version
  const restoreVersion = useCallback(
    async (promptId: string, versionId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await restorePromptVersionFn(user.uid, promptId, versionId);
        toast.success('Version restored successfully');
      } catch (error) {
        toast.error('Failed to restore version');
        throw error;
      }
    },
    [user?.uid]
  );

  // Bulk operations
  const bulkOperation = useCallback(
    async (
      promptIds: string[],
      action: BulkAction,
      payload?: { tagId?: string; categoryId?: string }
    ): Promise<BulkOperationResult> => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const result = await bulkOperationFn(user.uid, promptIds, action, payload);

        const actionLabels: Record<BulkAction, string> = {
          delete: 'moved to trash',
          restore: 'restored',
          favorite: 'added to favorites',
          unfavorite: 'removed from favorites',
          pin: 'pinned',
          unpin: 'unpinned',
          addTag: 'tagged',
          removeTag: 'untagged',
          moveToCategory: 'moved',
          permanentDelete: 'permanently deleted',
        };

        if (result.success > 0) {
          toast.success(`${result.success} prompt${result.success !== 1 ? 's' : ''} ${actionLabels[action]}`);
        }
        if (result.failed > 0) {
          toast.error(`${result.failed} prompt${result.failed !== 1 ? 's' : ''} failed`);
        }

        return result;
      } catch (error) {
        toast.error('Bulk operation failed');
        throw error;
      }
    },
    [user?.uid]
  );

  // Refetch function - clears error and reloads the page to reset subscription
  const refetch = useCallback(() => {
    setError(null);
    setLoading(true);
    // The subscription manager will re-subscribe automatically
    // Force a page reload as last resort
    window.location.reload();
  }, [setError, setLoading]);

  return {
    prompts,
    filteredPrompts: getFilteredPrompts(),
    isLoading,
    filters,
    sortOptions,
    setFilters,
    clearFilters,
    setSortOptions,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    copyPrompt,
    getPromptById,
    importPrompts,
    // Sprint 1: New exports
    duplicatePrompt,
    togglePin,
    softDeletePrompt,
    restorePrompt,
    permanentlyDeletePrompt,
    emptyTrash,
    getActivePrompts,
    getDeletedPrompts,
    getPinnedPrompts,
    // Sprint 2: New exports
    getPromptVersions,
    restoreVersion,
    bulkOperation,
    error,
    refetch,
  };
}
