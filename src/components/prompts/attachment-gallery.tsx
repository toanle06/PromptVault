'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, ZoomIn, GripVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { formatFileSize } from '@/lib/utils/file-utils';
import { AttachmentPreviewDialog } from './attachment-preview-dialog';
import type { PromptAttachment } from '@/types';

interface AttachmentGalleryProps {
  attachments: PromptAttachment[];
  onDelete?: (attachmentId: string) => Promise<void>;
  onReorder?: (orderedIds: string[]) => Promise<void>;
  isEditable?: boolean;
  className?: string;
}

export function AttachmentGallery({
  attachments,
  onDelete,
  onReorder,
  isEditable = false,
  className,
}: AttachmentGalleryProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
  };

  const handleClosePreview = () => {
    setPreviewIndex(null);
  };

  const handleNavigatePreview = (direction: 'prev' | 'next') => {
    if (previewIndex === null) return;

    if (direction === 'prev') {
      setPreviewIndex((previewIndex - 1 + attachments.length) % attachments.length);
    } else {
      setPreviewIndex((previewIndex + 1) % attachments.length);
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn('grid gap-3', className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              className={cn(
                'group relative aspect-square rounded-lg overflow-hidden border bg-muted',
                isEditable && 'cursor-move'
              )}
            >
              {/* Image */}
              {attachment.thumbnailUrl || attachment.url ? (
                <Image
                  src={attachment.thumbnailUrl || attachment.url}
                  alt={attachment.originalName}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

              {/* Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={() => handlePreview(index)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                {isEditable && onDelete && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => setDeleteId(attachment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Drag Handle */}
              {isEditable && onReorder && (
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1 rounded bg-black/50">
                    <GripVertical className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-xs text-white truncate font-medium">
                  {attachment.originalName}
                </p>
                <p className="text-xs text-white/70">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Dialog */}
      <AttachmentPreviewDialog
        attachments={attachments}
        currentIndex={previewIndex}
        onClose={handleClosePreview}
        onNavigate={handleNavigatePreview}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this attachment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
