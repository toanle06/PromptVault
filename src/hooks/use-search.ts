'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Fuse, { IFuseOptions } from 'fuse.js';
import { usePromptStore } from '@/store/prompt-store';
import { useUIStore } from '@/store/ui-store';
import type { Prompt } from '@/types';

const fuseOptions: IFuseOptions<Prompt> = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'content', weight: 1 },
    { name: 'description', weight: 0.5 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export function useSearch() {
  const { prompts } = usePromptStore();
  const { searchQuery, setSearchQuery, isSearchOpen, setSearchOpen, toggleSearch } = useUIStore();
  const [searchResults, setSearchResults] = useState<Prompt[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Initialize Fuse instance
  const fuse = useMemo(() => new Fuse(prompts, fuseOptions), [prompts]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('promptvault-recent-searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 10);
      localStorage.setItem('promptvault-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('promptvault-recent-searches');
  }, []);

  // Perform search
  const search = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setSearchResults([]);
        return [];
      }

      const results = fuse.search(query);
      const prompts = results.map((result) => result.item);
      setSearchResults(prompts);

      // Save to recent searches if query is meaningful
      if (query.trim().length >= 3) {
        saveRecentSearch(query.trim());
      }

      return prompts;
    },
    [fuse, setSearchQuery, saveRecentSearch]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, [setSearchQuery]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }

      // Escape to close search
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen, clearSearch]);

  return {
    searchQuery,
    searchResults,
    isSearchOpen,
    recentSearches,
    search,
    clearSearch,
    setSearchOpen,
    toggleSearch,
    clearRecentSearches,
  };
}
