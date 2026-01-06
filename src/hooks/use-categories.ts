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
import {
  getDemoCategories,
  createDemoCategory,
  updateDemoCategory,
  deleteDemoCategory,
  initializeDemoData,
} from '@/lib/demo/demo-store';
import type { Category } from '@/types';
import { toast } from 'sonner';

export function useCategories() {
  const { user, isDemoMode } = useAuthStore();
  const {
    categories,
    isLoadingCategories,
    setCategories,
    setLoadingCategories,
    getCategoryById,
    getCategoriesTree,
  } = usePromptStore();

  // Subscribe to categories (or load demo data)
  useEffect(() => {
    if (!user?.uid) {
      setCategories([]);
      return;
    }

    // Demo mode - load from localStorage
    if (isDemoMode) {
      initializeDemoData();
      setCategories(getDemoCategories());
      setLoadingCategories(false);
      return;
    }

    // Firebase mode
    setLoadingCategories(true);
    const unsubscribe = subscribeToCategories(user.uid, (newCategories) => {
      setCategories(newCategories);
    });

    return () => unsubscribe();
  }, [user?.uid, isDemoMode, setCategories, setLoadingCategories]);

  // Create category
  const createCategory = useCallback(
    async (data: Omit<Category, 'id' | 'createdAt' | 'promptCount'>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        let id: string;
        if (isDemoMode) {
          id = createDemoCategory(data);
          setCategories(getDemoCategories());
        } else {
          id = await createCategoryFn(user.uid, data);
        }
        toast.success('Category created successfully');
        return id;
      } catch (error) {
        toast.error('Failed to create category');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setCategories]
  );

  // Update category
  const updateCategory = useCallback(
    async (categoryId: string, data: Partial<Category>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          updateDemoCategory(categoryId, data);
          setCategories(getDemoCategories());
        } else {
          await updateCategoryFn(user.uid, categoryId, data);
        }
        toast.success('Category updated successfully');
      } catch (error) {
        toast.error('Failed to update category');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setCategories]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (categoryId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          deleteDemoCategory(categoryId);
          setCategories(getDemoCategories());
        } else {
          await deleteCategoryFn(user.uid, categoryId);
        }
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete category');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setCategories]
  );

  // Import categories
  const importCategories = useCallback(
    async (categoriesData: Partial<Category>[]) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          categoriesData.forEach(cat => {
            createDemoCategory({
              name: cat.name || 'Untitled',
              color: cat.color || '#6366f1',
              icon: cat.icon || '',
              parentId: cat.parentId || '',
              order: cat.order || 0,
            });
          });
          setCategories(getDemoCategories());
        } else {
          await importCategoriesFn(user.uid, categoriesData);
        }
      } catch (error) {
        toast.error('Failed to import categories');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setCategories]
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
