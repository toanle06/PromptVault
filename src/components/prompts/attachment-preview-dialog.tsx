'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatFileSize } from '@/lib/utils/file-utils';
import type { PromptAttachment } from '@/types';

interface AttachmentPreviewDialogProps {
  attachments: PromptAttachment[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function AttachmentPreviewDialog({
  attachments,
  currentIndex,
  onClose,
  onNavigate,
}: AttachmentPreviewDialogProps) {
  const isOpen = currentIndex !== null;
  const attachment = currentIndex !== null ? attachments[currentIndex] : null;
  const hasMultiple = attachments.length > 1;

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          onNavigate('prev');
          break;
        case 'ArrowRight':
          onNavigate('next');
          break;
        case 'Escape':
          onClose();
          break;
      }
    },
    [isOpen, onNavigate, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = () => {
    if (!attachment) return;
    window.open(attachment.url, '_blank');
  };

  const handleOpenOriginal = () => {
    if (!attachment) return;
    window.open(attachment.url, '_blank');
  };

  if (!attachment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur">
        <DialogTitle className="sr-only">
          Image Preview - {attachment.originalName}
        </DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{attachment.originalName}</h3>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(attachment.size)}
              {hasMultiple && ` • ${currentIndex! + 1} of ${attachments.length}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleOpenOriginal}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={attachment.url}
              alt={attachment.originalName}
              fill
              className="object-contain"
              sizes="95vw"
              priority
            />
          </div>

          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
                onClick={() => onNavigate('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
                onClick={() => onNavigate('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {hasMultiple && (
          <div className="flex gap-2 p-4 border-t overflow-x-auto">
            {attachments.map((att, index) => (
              <button
                key={att.id}
                onClick={() => onNavigate(index < currentIndex! ? 'prev' : 'next')}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors',
                  index === currentIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
              >
                <Image
                  src={att.thumbnailUrl || att.url}
                  alt={att.originalName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
