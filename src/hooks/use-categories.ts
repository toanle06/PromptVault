'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usePromptStore } from '@/store/prompt-store';
import {
  subscribeToCategories,
  createCategory as createCategoryFn,
  updateCategory as updateCategoryFn,
  deleteCategory as deleteCategoryFn,
  importCategories as importCategoriesFn,
} from '@/lib/firebase/firestore';
import type { Category } from '@/types';
import { toast } from 'sonner';

export function useCategories() {
  const { user } = useAuthStore();
  const {
    categories,
    isLoadingCategories,
    setCategories,
    setLoadingCategories,
    getCategoryById,
    getCategoriesTree,
  } = usePromptStore();

  // Subscribe to categories
  useEffect(() => {
    if (!user?.uid) {
      setCategories([]);
      return;
    }

    setLoadingCategories(true);
    const unsubscribe = subscribeToCategories(user.uid, (newCategories) => {
      setCategories(newCategories);
    });

    return () => unsubscribe();
  }, [user?.uid, setCategories, setLoadingCategories]);

  // Create category
  const createCategory = useCallback(
    async (data: Omit<Category, 'id' | 'createdAt' | 'promptCount'>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const id = await createCategoryFn(user.uid, data);
        toast.success('Category created successfully');
        return id;
      } catch (error) {
        toast.error('Failed to create category');
        throw error;
      }
    },
    [user?.uid]
  );

  // Update category
  const updateCategory = useCallback(
    async (categoryId: string, data: Partial<Category>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await updateCategoryFn(user.uid, categoryId, data);
        toast.success('Category updated successfully');
      } catch (error) {
        toast.error('Failed to update category');
        throw error;
      }
    },
    [user?.uid]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (categoryId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await deleteCategoryFn(user.uid, categoryId);
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete category');
        throw error;
      }
    },
    [user?.uid]
  );

  // Import categories
  const importCategories = useCallback(
    async (categoriesData: Partial<Category>[]) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await importCategoriesFn(user.uid, categoriesData);
      } catch (error) {
        toast.error('Failed to import categories');
        throw error;
      }
    },
    [user?.uid]
  );

  return {
    categories,
    isLoading: isLoadingCategories,
    categoriesTree: getCategoriesTree(),
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    importCategories,
  };
}
