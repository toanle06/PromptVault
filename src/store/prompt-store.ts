import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';
import type { Prompt, Category, Tag, ExpertRole, PromptFilters, SortOptions } from '@/types';

interface PromptState {
  // Data
  prompts: Prompt[];
  categories: Category[];
  tags: Tag[];
  expertRoles: ExpertRole[];

  // Filters & Sort
  filters: PromptFilters;
  sortOptions: SortOptions;

  // Loading states
  isLoading: boolean;
  isLoadingCategories: boolean;
  isLoadingTags: boolean;
  error: string | null;

  // Actions - Data
  setPrompts: (prompts: Prompt[]) => void;
  setCategories: (categories: Category[]) => void;
  setTags: (tags: Tag[]) => void;
  setExpertRoles: (roles: ExpertRole[]) => void;

  // Actions - Filters
  setFilters: (filters: Partial<PromptFilters>) => void;
  clearFilters: () => void;
  setSortOptions: (options: SortOptions) => void;

  // Actions - Loading
  setLoading: (loading: boolean) => void;
  setLoadingCategories: (loading: boolean) => void;
  setLoadingTags: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed
  getFilteredPrompts: () => Prompt[];
  getCategoryById: (id: string) => Category | undefined;
  getTagById: (id: string) => Tag | undefined;
  getExpertRoleById: (id: string) => ExpertRole | undefined;
  getCategoriesTree: () => { main: Category[]; subs: Record<string, Category[]> };
}

const defaultFilters: PromptFilters = {
  categoryId: undefined,
  subcategoryId: undefined,
  tags: undefined,
  expertRoleId: undefined,
  isFavorite: undefined,
  isPinned: undefined,
  searchQuery: undefined,
};

const defaultSortOptions: SortOptions = {
  field: 'createdAt',
  direction: 'desc',
};

export const usePromptStore = create<PromptState>()((set, get) => ({
  // Initial data
  prompts: [],
  categories: [],
  tags: [],
  expertRoles: [],
  filters: defaultFilters,
  sortOptions: defaultSortOptions,
  isLoading: true,
  isLoadingCategories: true,
  isLoadingTags: true,
  error: null,

  // Actions - Data
  setPrompts: (prompts) => set({ prompts, isLoading: false }),
  setCategories: (categories) => set({ categories, isLoadingCategories: false }),
  setTags: (tags) => set({ tags, isLoadingTags: false }),
  setExpertRoles: (expertRoles) => set({ expertRoles }),

  // Actions - Filters
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  clearFilters: () => set({ filters: defaultFilters }),
  setSortOptions: (sortOptions) => set({ sortOptions }),

  // Actions - Loading
  setLoading: (isLoading) => set({ isLoading }),
  setLoadingCategories: (isLoadingCategories) => set({ isLoadingCategories }),
  setLoadingTags: (isLoadingTags) => set({ isLoadingTags }),
  setError: (error) => set({ error }),

  // Computed
  getFilteredPrompts: () => {
    const { prompts, filters, sortOptions } = get();

    // First, filter out deleted prompts (unless we're viewing trash)
    let filtered = prompts.filter((p) => !p.isDeleted);

    // Apply filters
    if (filters.categoryId) {
      filtered = filtered.filter(
        (p) => p.categoryId === filters.categoryId || p.subcategoryId === filters.categoryId
      );
    }

    if (filters.subcategoryId) {
      filtered = filtered.filter((p) => p.subcategoryId === filters.subcategoryId);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((p) =>
        filters.tags!.some((tag) => p.tags?.includes(tag))
      );
    }

    if (filters.expertRoleId) {
      filtered = filtered.filter((p) => p.expertRoleId === filters.expertRoleId);
    }

    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter((p) => p.isFavorite === filters.isFavorite);
    }

    if (filters.isPinned !== undefined) {
      filtered = filtered.filter((p) => p.isPinned === filters.isPinned);
    }

    // Note: Text search is handled separately with Fuse.js

    // Apply sorting with pinned prompts always first
    filtered.sort((a, b) => {
      // Pinned prompts always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // If both pinned or both not pinned, sort by pinnedAt first for pinned items
      if (a.isPinned && b.isPinned) {
        const aPinDate = a.pinnedAt instanceof Timestamp ? a.pinnedAt.toDate() : new Date(0);
        const bPinDate = b.pinnedAt instanceof Timestamp ? b.pinnedAt.toDate() : new Date(0);
        return bPinDate.getTime() - aPinDate.getTime(); // Most recently pinned first
      }

      // Then apply normal sorting
      const aVal = a[sortOptions.field];
      const bVal = b[sortOptions.field];

      if (sortOptions.field === 'title') {
        const aStr = typeof aVal === 'string' ? aVal : '';
        const bStr = typeof bVal === 'string' ? bVal : '';
        const comparison = aStr.localeCompare(bStr);
        return sortOptions.direction === 'asc' ? comparison : -comparison;
      }

      if (sortOptions.field === 'usageCount') {
        const aNum = typeof aVal === 'number' ? aVal : 0;
        const bNum = typeof bVal === 'number' ? bVal : 0;
        const comparison = aNum - bNum;
        return sortOptions.direction === 'asc' ? comparison : -comparison;
      }

      // Date fields - handle Timestamp objects
      const aDate = aVal instanceof Timestamp ? aVal.toDate() : new Date(0);
      const bDate = bVal instanceof Timestamp ? bVal.toDate() : new Date(0);
      const comparison = aDate.getTime() - bDate.getTime();
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),
  getTagById: (id) => get().tags.find((t) => t.id === id),
  getExpertRoleById: (id) => get().expertRoles.find((r) => r.id === id),

  getCategoriesTree: () => {
    const { categories } = get();
    const main = categories.filter((c) => !c.parentId);
    const subs: Record<string, Category[]> = {};

    categories
      .filter((c) => c.parentId)
      .forEach((c) => {
        if (!subs[c.parentId!]) {
          subs[c.parentId!] = [];
        }
        subs[c.parentId!].push(c);
      });

    return { main, subs };
  },
}));
