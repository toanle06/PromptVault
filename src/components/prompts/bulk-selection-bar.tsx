'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
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
import { usePrompts } from '@/hooks/use-prompts';
import { useCategories } from '@/hooks/use-categories';
import { useTags } from '@/hooks/use-tags';
import type { BulkAction } from '@/types';
import {
  X,
  Trash2,
  Star,
  StarOff,
  Pin,
  PinOff,
  Tag,
  FolderOpen,
  MoreHorizontal,
  Loader2,
  CheckSquare,
} from 'lucide-react';

interface BulkSelectionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onSelectAll?: () => void;
  totalCount?: number;
  isTrashView?: boolean;
}

export function BulkSelectionBar({
  selectedIds,
  onClearSelection,
  onSelectAll,
  totalCount,
  isTrashView = false,
}: BulkSelectionBarProps) {
  const { bulkOperation } = usePrompts();
  const { categoriesTree } = useCategories();
  const { tags } = useTags();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: BulkAction;
    payload?: { tagId?: string; categoryId?: string };
  } | null>(null);

  const handleBulkAction = async (
    action: BulkAction,
    payload?: { tagId?: string; categoryId?: string }
  ) => {
    // For delete actions, show confirmation
    if (action === 'delete' || action === 'permanentDelete') {
      setPendingAction({ action, payload });
      setShowDeleteConfirm(true);
      return;
    }

    await executeBulkAction(action, payload);
  };

  const executeBulkAction = async (
    action: BulkAction,
    payload?: { tagId?: string; categoryId?: string }
  ) => {
    setIsProcessing(true);
    try {
      await bulkOperation(selectedIds, action, payload);
      onClearSelection();
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
      setPendingAction(null);
    }
  };

  const confirmDelete = async () => {
    if (pendingAction) {
      await executeBulkAction(pendingAction.action, pendingAction.payload);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground p-3 rounded-lg shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {selectedIds.length} selected
            {totalCount && onSelectAll && selectedIds.length < totalCount && (
              <Button
                variant="link"
                className="text-primary-foreground underline ml-2 p-0 h-auto"
                onClick={onSelectAll}
              >
                Select all {totalCount}
              </Button>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isTrashView ? (
            // Trash view actions
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction('restore')}
                disabled={isProcessing}
              >
                Restore
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('permanentDelete')}
                disabled={isProcessing}
              >
                Delete Forever
              </Button>
            </>
          ) : (
            // Normal view actions
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction('favorite')}
                disabled={isProcessing}
              >
                <Star className="h-4 w-4 mr-1" />
                Favorite
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkAction('pin')}
                disabled={isProcessing}
              >
                <Pin className="h-4 w-4 mr-1" />
                Pin
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" disabled={isProcessing}>
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleBulkAction('unfavorite')}>
                    <StarOff className="mr-2 h-4 w-4" />
                    Remove Favorite
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('unpin')}>
                    <PinOff className="mr-2 h-4 w-4" />
                    Unpin
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Add Tag submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Tag className="mr-2 h-4 w-4" />
                      Add Tag
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                      {tags.map((tag) => (
                        <DropdownMenuItem
                          key={tag.id}
                          onClick={() => handleBulkAction('addTag', { tagId: tag.id })}
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color || '#6366f1' }}
                          />
                          {tag.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {/* Move to Category submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Move to Category
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-48 overflow-y-auto">
                      <DropdownMenuItem
                        onClick={() => handleBulkAction('moveToCategory', { categoryId: '' })}
                      >
                        No Category
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {categoriesTree.main.map((category) => (
                        <DropdownMenuItem
                          key={category.id}
                          onClick={() =>
                            handleBulkAction('moveToCategory', { categoryId: category.id })
                          }
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color || '#6366f1' }}
                          />
                          {category.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => handleBulkAction('delete')}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Move to Trash
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === 'permanentDelete'
                ? 'Permanently Delete?'
                : 'Move to Trash?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === 'permanentDelete' ? (
                <>
                  Are you sure you want to permanently delete {selectedIds.length} prompt
                  {selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to move {selectedIds.length} prompt
                  {selectedIds.length !== 1 ? 's' : ''} to trash? You can restore them later.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : pendingAction?.action === 'permanentDelete' ? (
                'Delete Forever'
              ) : (
                'Move to Trash'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
