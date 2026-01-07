'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PromptCardSkeleton } from '@/components/ui/skeleton-variants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PromptCard } from './prompt-card';
import { BulkSelectionBar } from './bulk-selection-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { usePrompts } from '@/hooks/use-prompts';
import { useUIStore } from '@/store/ui-store';
import type { Prompt, SortOptions } from '@/types';
import { LayoutGrid, List, CheckSquare, Square, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptListProps {
  prompts: Prompt[];
  isLoading?: boolean;
  isTrashView?: boolean;
}

export function PromptList({ prompts, isLoading, isTrashView = false }: PromptListProps) {
  const router = useRouter();
  const { deletePrompt, sortOptions, setSortOptions } = usePrompts();
  const { viewMode, setViewMode, setCreatePromptOpen } = useUIStore();
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectionChange = useCallback((promptId: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, promptId] : prev.filter((id) => id !== promptId)
    );
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(prompts.map((p) => p.id));
  }, [prompts]);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) {
        // Exiting selection mode, clear selections
        setSelectedIds([]);
      }
      return !prev;
    });
  }, []);

  const handleEdit = (prompt: Prompt) => {
    router.push(`/prompts/${prompt.id}?edit=true`);
  };

  const handleDelete = async () => {
    if (!promptToDelete) return;

    setIsDeleting(true);
    try {
      await deletePrompt(promptToDelete.id);
    } finally {
      setIsDeleting(false);
      setPromptToDelete(null);
    }
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortOptions['field'], SortOptions['direction']];
    setSortOptions({ field, direction });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
            <div className="h-9 w-40 bg-muted rounded-md animate-pulse" />
            <div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selection Mode Toggle */}
          <Button
            variant={isSelectionMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleSelectionMode}
            className="gap-1"
          >
            {isSelectionMode ? (
              <>
                <CheckSquare className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                Select
              </>
            )}
          </Button>

          {/* Sort */}
          <Select
            value={`${sortOptions.field}-${sortOptions.direction}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest first</SelectItem>
              <SelectItem value="createdAt-asc">Oldest first</SelectItem>
              <SelectItem value="title-asc">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
              <SelectItem value="usageCount-desc">Most used</SelectItem>
              <SelectItem value="updatedAt-desc">Recently updated</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-r-none',
                viewMode === 'grid' && 'bg-muted'
              )}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-l-none',
                viewMode === 'list' && 'bg-muted'
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {isSelectionMode && selectedIds.length > 0 && (
        <BulkSelectionBar
          selectedIds={selectedIds}
          prompts={prompts}
          onClearSelection={handleClearSelection}
          onSelectAll={handleSelectAll}
          totalCount={prompts.length}
          isTrashView={isTrashView}
        />
      )}

      {/* Prompts Grid/List */}
      {prompts.length > 0 ? (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        )}>
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={handleEdit}
              onDelete={setPromptToDelete}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(prompt.id)}
              onSelectionChange={handleSelectionChange}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No prompts found"
          description="Create your first prompt or adjust your filters"
          actionLabel="Create Prompt"
          onAction={() => setCreatePromptOpen(true)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!promptToDelete}
        onOpenChange={(open) => !open && setPromptToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{promptToDelete?.title}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
