import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type ViewMode = 'grid' | 'list';

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Theme
  theme: Theme;

  // View
  viewMode: ViewMode;

  // Search
  isSearchOpen: boolean;
  searchQuery: string;

  // Selected items
  selectedPromptId: string | null;

  // Modals
  isCreatePromptOpen: boolean;
  isEditPromptOpen: boolean;
  isDeleteDialogOpen: boolean;

  // Actions - Sidebar
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Actions - Theme
  setTheme: (theme: Theme) => void;

  // Actions - View
  setViewMode: (mode: ViewMode) => void;

  // Actions - Search
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;

  // Actions - Selection
  setSelectedPromptId: (id: string | null) => void;

  // Actions - Modals
  setCreatePromptOpen: (open: boolean) => void;
  setEditPromptOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'system',
      viewMode: 'grid',
      isSearchOpen: false,
      searchQuery: '',
      selectedPromptId: null,
      isCreatePromptOpen: false,
      isEditPromptOpen: false,
      isDeleteDialogOpen: false,

      // Actions - Sidebar
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      // Actions - Theme
      setTheme: (theme) => set({ theme }),

      // Actions - View
      setViewMode: (viewMode) => set({ viewMode }),

      // Actions - Search
      setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      // Actions - Selection
      setSelectedPromptId: (selectedPromptId) => set({ selectedPromptId }),

      // Actions - Modals
      setCreatePromptOpen: (isCreatePromptOpen) => set({ isCreatePromptOpen }),
      setEditPromptOpen: (isEditPromptOpen) => set({ isEditPromptOpen }),
      setDeleteDialogOpen: (isDeleteDialogOpen) => set({ isDeleteDialogOpen }),
    }),
    {
      name: 'promptvault-ui',
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
