'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PromptList } from '@/components/prompts/prompt-list';
import { usePrompts } from '@/hooks/use-prompts';
import { useUIStore } from '@/store/ui-store';
import { Plus, Star, Pin } from 'lucide-react';

export default function PromptsPage() {
  const searchParams = useSearchParams();
  const { filteredPrompts, isLoading, setFilters, clearFilters } = usePrompts();
  const { setCreatePromptOpen } = useUIStore();

  const showFavorites = searchParams.get('favorites') === 'true';
  const showPinned = searchParams.get('pinned') === 'true';

  // Apply filters based on URL params
  useEffect(() => {
    if (showFavorites) {
      setFilters({ isFavorite: true, isPinned: undefined });
    } else if (showPinned) {
      setFilters({ isPinned: true, isFavorite: undefined });
    } else {
      clearFilters();
    }
  }, [showFavorites, showPinned, setFilters, clearFilters]);

  // Determine page title
  const pageTitle = showFavorites ? 'Favorites' : showPinned ? 'Pinned Prompts' : 'Prompts';
  const pageDescription = showFavorites
    ? 'Your favorite prompts'
    : showPinned
    ? 'Quick access to your pinned prompts'
    : 'Manage and organize your AI prompts';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {showFavorites && <Star className="h-7 w-7 text-yellow-500 fill-yellow-500" />}
            {showPinned && <Pin className="h-7 w-7 text-primary" />}
            {pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {pageDescription}
          </p>
        </div>
        <Button onClick={() => setCreatePromptOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {/* Prompts List */}
      <PromptList prompts={filteredPrompts} isLoading={isLoading} />
    </div>
  );
}
