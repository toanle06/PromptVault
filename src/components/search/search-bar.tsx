'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/use-search';
import { useCategories } from '@/hooks/use-categories';
import { Search, FileText, Clock } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const {
    searchQuery,
    searchResults,
    isSearchOpen,
    recentSearches,
    search,
    clearSearch,
    setSearchOpen,
    clearRecentSearches,
  } = useSearch();
  const { getCategoryById } = useCategories();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Show dropdown when focused or has query
  const showDropdown = isFocused || searchQuery.length > 0;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        if (searchQuery.length === 0) {
          setSearchOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery, setSearchOpen]);

  // Handle keyboard shortcut (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
      if (event.key === 'Escape') {
        inputRef.current?.blur();
        setIsFocused(false);
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearSearch]);

  // Handle search input
  const handleSearch = (value: string) => {
    search(value);
    setSearchOpen(true);
  };

  // Handle select prompt
  const handleSelectPrompt = (promptId: string) => {
    setIsFocused(false);
    clearSearch();
    router.push(`/prompts/${promptId}`);
  };

  // Handle select recent search
  const handleSelectRecent = (query: string) => {
    search(query);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setSearchOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-64 md:w-80 lg:w-96">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleFocus}
          className="pl-9 pr-12 h-9"
          aria-label="Search prompts"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Results</p>
              {searchResults.map((prompt) => {
                const category = prompt.categoryId
                  ? getCategoryById(prompt.categoryId)
                  : null;

                return (
                  <button
                    key={prompt.id}
                    onClick={() => handleSelectPrompt(prompt.id)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-left rounded-sm hover:bg-accent transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{prompt.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {prompt.content.slice(0, 80)}...
                      </p>
                    </div>
                    {category && (
                      <Badge
                        variant="outline"
                        className="shrink-0"
                        style={{ borderColor: category.color || undefined }}
                      >
                        {category.name}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {searchQuery.length > 0 && searchResults.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No prompts found for "{searchQuery}"
            </div>
          )}

          {/* Recent Searches */}
          {searchQuery === '' && recentSearches.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-xs font-medium text-muted-foreground">Recent Searches</p>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectRecent(query)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-left rounded-sm hover:bg-accent transition-colors"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{query}</span>
                </button>
              ))}
            </div>
          )}

          {/* Empty State - Show hint */}
          {searchQuery === '' && recentSearches.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type to search prompts...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
