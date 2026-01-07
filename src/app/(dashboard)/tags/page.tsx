'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TagChipSkeleton } from '@/components/ui/skeleton-variants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useTags } from '@/hooks/use-tags';
import { usePrompts } from '@/hooks/use-prompts';
import { EmptyState } from '@/components/ui/empty-state';
import type { Tag, TagFormData } from '@/types';
import { Plus, Edit, Trash2, Tags, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e',
];

export default function TagsPage() {
  const { tags, isLoading, createTag, updateTag, deleteTag } = useTags();
  const { prompts } = usePrompts();

  const [showDialog, setShowDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const resetForm = () => {
    setName('');
    setColor(COLORS[0]);
    setEditingTag(null);
  };

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setName(tag.name);
      setColor(tag.color || COLORS[0]);
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Check for duplicate name (case-insensitive)
    const trimmedName = name.trim().toLowerCase();
    const existingTag = tags.find(
      (t) => t.name.toLowerCase() === trimmedName && t.id !== editingTag?.id
    );

    if (existingTag) {
      toast.error(`Tag "${name.trim()}" already exists`);
      return;
    }

    setIsSubmitting(true);
    try {
      const data: TagFormData = {
        name: name.trim(),
        color,
      };

      if (editingTag) {
        await updateTag(editingTag.id, data);
      } else {
        await createTag(data);
      }
      handleCloseDialog();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTag(tagToDelete.id);
    } finally {
      setIsDeleting(false);
      setTagToDelete(null);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      // Delete all tags one by one
      for (const tag of tags) {
        await deleteTag(tag.id);
      }
      toast.success(`Deleted ${tags.length} tags`);
    } catch (error) {
      console.error('Delete all error:', error);
      toast.error('Failed to delete all tags');
    } finally {
      setIsDeletingAll(false);
      setShowDeleteAllDialog(false);
    }
  };

  const getPromptCount = (tagId: string): number => {
    return prompts.filter((p) => p.tags.includes(tagId)).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-5 w-56 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-muted rounded-md animate-pulse" />
        </div>
        <Card>
          <CardHeader>
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TagChipSkeleton key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            Create tags to categorize and filter your prompts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tags.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteAllDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        </div>
      </div>

      {/* Tags List */}
      {tags.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Tags ({tags.length})</CardTitle>
            <CardDescription>
              Click on a tag to edit it
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg border hover:shadow-sm transition-shadow"
                  style={{
                    borderColor: tag.color || undefined,
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tag.color || '#6366f1' }}
                  />
                  <span className="font-medium">{tag.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {getPromptCount(tag.id)}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleOpenDialog(tag)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setTagToDelete(tag)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-0">
            <EmptyState
              preset="tags"
              onAction={() => handleOpenDialog()}
            />
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Edit Tag' : 'Create Tag'}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? 'Update the tag details'
                : 'Add a new tag to categorize your prompts'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tag name"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                      color === c ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingTag ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!tagToDelete}
        onOpenChange={(open) => !open && setTagToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{tagToDelete?.name}&quot;?
              {getPromptCount(tagToDelete?.id || '') > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This tag is used by {getPromptCount(tagToDelete?.id || '')} prompts.
                  It will be removed from them.
                </span>
              )}
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

      {/* Delete All Confirmation */}
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Tags</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {tags.length} tags?
              <span className="block mt-2 text-destructive">
                This action cannot be undone. All tags will be removed from prompts.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingAll ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
