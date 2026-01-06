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
} from '@/lib/firebase/firestore';
import {
  getDemoPrompts,
  createDemoPrompt,
  updateDemoPrompt,
  deleteDemoPrompt,
  initializeDemoData,
} from '@/lib/demo/demo-store';
import type { PromptFormData, Prompt } from '@/types';
import { toast } from 'sonner';

export function usePrompts() {
  const { user, isDemoMode } = useAuthStore();
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
  } = usePromptStore();

  // Subscribe to prompts (or load demo data)
  useEffect(() => {
    if (!user?.uid) {
      setPrompts([]);
      return;
    }

    // Demo mode - load from localStorage
    if (isDemoMode) {
      initializeDemoData();
      setPrompts(getDemoPrompts());
      setLoading(false);
      return;
    }

    // Firebase mode
    setLoading(true);
    const unsubscribe = subscribeToPrompts(user.uid, (newPrompts) => {
      setPrompts(newPrompts);
    });

    return () => unsubscribe();
  }, [user?.uid, isDemoMode, setPrompts, setLoading]);

  // Create prompt
  const createPrompt = useCallback(
    async (data: PromptFormData) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        let id: string;
        if (isDemoMode) {
          id = createDemoPrompt({ ...data, tags: data.tags || [], isFavorite: data.isFavorite || false });
          setPrompts(getDemoPrompts());
        } else {
          id = await createPromptFn(user.uid, data);
        }
        toast.success('Prompt created successfully');
        return id;
      } catch (error) {
        toast.error('Failed to create prompt');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setPrompts]
  );

  // Update prompt
  const updatePrompt = useCallback(
    async (promptId: string, data: Partial<PromptFormData>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          updateDemoPrompt(promptId, data);
          setPrompts(getDemoPrompts());
        } else {
          await updatePromptFn(user.uid, promptId, data);
        }
        toast.success('Prompt updated successfully');
      } catch (error) {
        toast.error('Failed to update prompt');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setPrompts]
  );

  // Delete prompt
  const deletePrompt = useCallback(
    async (promptId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          deleteDemoPrompt(promptId);
          setPrompts(getDemoPrompts());
        } else {
          await deletePromptFn(user.uid, promptId);
        }
        toast.success('Prompt deleted successfully');
      } catch (error) {
        toast.error('Failed to delete prompt');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setPrompts]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (promptId: string, isFavorite: boolean) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          updateDemoPrompt(promptId, { isFavorite });
          setPrompts(getDemoPrompts());
        } else {
          await toggleFavoriteFn(user.uid, promptId, isFavorite);
        }
        toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
      } catch (error) {
        toast.error('Failed to update favorite status');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setPrompts]
  );

  // Copy prompt and increment usage count
  const copyPrompt = useCallback(
    async (promptId: string, content: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await navigator.clipboard.writeText(content);
        if (isDemoMode) {
          const prompt = getDemoPrompts().find(p => p.id === promptId);
          if (prompt) {
            updateDemoPrompt(promptId, { usageCount: (prompt.usageCount || 0) + 1 });
            setPrompts(getDemoPrompts());
          }
        } else {
          await incrementUsageFn(user.uid, promptId);
        }
        toast.success('Copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy prompt');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setPrompts]
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
  };
}
