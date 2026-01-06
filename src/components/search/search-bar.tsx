'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/use-search';
import { useCategories } from '@/hooks/use-categories';
import { Search, FileText, Clock, X } from 'lucide-react';

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

  // Handle search input
  const handleSearch = (value: string) => {
    search(value);
  };

  // Handle select prompt
  const handleSelectPrompt = (promptId: string) => {
    setSearchOpen(false);
    clearSearch();
    router.push(`/prompts/${promptId}`);
  };

  // Handle select recent search
  const handleSelectRecent = (query: string) => {
    search(query);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:w-64 md:w-80 lg:w-96"
        onClick={() => setSearchOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Search prompts...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <CommandDialog open={isSearchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search prompts by title, content..."
          value={searchQuery}
          onValueChange={handleSearch}
          ref={inputRef}
        />
        <CommandList>
          <CommandEmpty>No prompts found.</CommandEmpty>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <CommandGroup heading="Results">
              {searchResults.map((prompt) => {
                const category = prompt.categoryId
                  ? getCategoryById(prompt.categoryId)
                  : null;

                return (
                  <CommandItem
                    key={prompt.id}
                    value={prompt.id}
                    onSelect={() => handleSelectPrompt(prompt.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <div className="flex flex-1 flex-col">
                      <span className="font-medium">{prompt.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {prompt.content.slice(0, 100)}...
                      </span>
                    </div>
                    {category && (
                      <Badge
                        variant="outline"
                        className="ml-2"
                        style={{
                          borderColor: category.color || undefined,
                        }}
                      >
                        {category.name}
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Recent Searches */}
          {searchQuery === '' && recentSearches.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((query, index) => (
                  <CommandItem
                    key={index}
                    value={`recent-${query}`}
                    onSelect={() => handleSelectRecent(query)}
                  >
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{query}</span>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={clearRecentSearches}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear recent searches
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {/* Quick Actions */}
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                setSearchOpen(false);
                router.push('/prompts/new');
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Create new prompt
              <kbd className="ml-auto pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium hidden sm:flex">
                <span className="text-xs">⌘</span>N
              </kbd>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
