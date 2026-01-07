'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Trash2, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TrashPage() {
  const { getDeletedPrompts, restorePrompt, permanentlyDeletePrompt, emptyTrash, isLoading } = usePrompts();
  const { getCategoryById } = useCategories();

  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showEmptyTrashDialog, setShowEmptyTrashDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

  const deletedPrompts = getDeletedPrompts();

  const handleRestore = async (promptId: string) => {
    setIsRestoring(promptId);
    try {
      await restorePrompt(promptId);
    } finally {
      setIsRestoring(null);
    }
  };

  const handlePermanentDelete = async (promptId: string) => {
    setIsDeleting(promptId);
    try {
      await permanentlyDeletePrompt(promptId);
    } finally {
      setIsDeleting(null);
      setShowDeleteDialog(null);
    }
  };

  const handleEmptyTrash = async () => {
    setIsEmptyingTrash(true);
    try {
      await emptyTrash();
    } finally {
      setIsEmptyingTrash(false);
      setShowEmptyTrashDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
          <p className="text-muted-foreground">
            {deletedPrompts.length} deleted prompt{deletedPrompts.length !== 1 ? 's' : ''}
          </p>
        </div>
        {deletedPrompts.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setShowEmptyTrashDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Empty Trash
          </Button>
        )}
      </div>

      {/* Empty state */}
      {deletedPrompts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Trash is empty</h2>
            <p className="text-muted-foreground text-center max-w-sm">
              When you delete prompts, they will appear here. You can restore them or permanently delete them.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deletedPrompts.map((prompt) => {
            const category = prompt.categoryId ? getCategoryById(prompt.categoryId) : null;
            const deletedAt = prompt.deletedAt?.toDate?.() || new Date();

            return (
              <Card key={prompt.id} className="opacity-75 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{prompt.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {prompt.content.substring(0, 150)}...
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(prompt.id)}
                        disabled={isRestoring === prompt.id}
                      >
                        {isRestoring === prompt.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-2 h-4 w-4" />
                        )}
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteDialog(prompt.id)}
                        disabled={isDeleting === prompt.id}
                      >
                        {isDeleting === prompt.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {category && (
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: category.color ? `${category.color}20` : undefined,
                          color: category.color || undefined,
                        }}
                      >
                        {category.name}
                      </Badge>
                    )}
                    <span>Deleted {formatDistanceToNow(deletedAt, { addSuffix: true })}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty Trash Confirmation Dialog */}
      <AlertDialog open={showEmptyTrashDialog} onOpenChange={setShowEmptyTrashDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Empty Trash
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete all {deletedPrompts.length} prompt{deletedPrompts.length !== 1 ? 's' : ''} in the trash?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEmptyingTrash}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmptyTrash}
              disabled={isEmptyingTrash}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isEmptyingTrash ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Permanently Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this prompt?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handlePermanentDelete(showDeleteDialog)}
              disabled={!!isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
