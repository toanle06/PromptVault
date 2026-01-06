'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { usePrompts } from '@/hooks/use-prompts';
import { useUIStore } from '@/store/ui-store';
import type { Prompt, SortOptions } from '@/types';
import { LayoutGrid, List, Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptListProps {
  prompts: Prompt[];
  isLoading?: boolean;
}

export function PromptList({ prompts, isLoading }: PromptListProps) {
  const router = useRouter();
  const { deletePrompt, sortOptions, setSortOptions } = usePrompts();
  const { viewMode, setViewMode, setCreatePromptOpen } = useUIStore();
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
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
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No prompts found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first prompt or adjust your filters
          </p>
          <Button onClick={() => setCreatePromptOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Prompt
          </Button>
        </div>
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
