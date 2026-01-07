'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getAcceptedFileTypes, formatFileSize } from '@/lib/utils/file-utils';
import { MAX_FILE_SIZE, MAX_ATTACHMENTS_PER_PROMPT } from '@/types';
import type { AttachmentUploadProgress } from '@/types';

interface AttachmentUploaderProps {
  onUpload: (files: File[]) => Promise<unknown>;
  uploadProgress: AttachmentUploadProgress[];
  currentCount: number;
  disabled?: boolean;
  className?: string;
}

export function AttachmentUploader({
  onUpload,
  uploadProgress,
  currentCount,
  disabled = false,
  className,
}: AttachmentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadProgress.some((p) => p.status === 'uploading');
  const canUpload = currentCount < MAX_ATTACHMENTS_PER_PROMPT && !disabled;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (canUpload) {
      setIsDragging(true);
    }
  }, [canUpload]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (!canUpload) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await onUpload(files);
      }
    },
    [canUpload, onUpload]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await onUpload(files);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onUpload]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          !canUpload && 'opacity-50 cursor-not-allowed',
          canUpload && 'cursor-pointer'
        )}
        onClick={canUpload ? handleButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedFileTypes()}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={!canUpload}
        />

        <div className="flex flex-col items-center gap-2 text-center">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          )}

          <div>
            <p className="text-sm font-medium">
              {isDragging ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            JPEG, PNG, GIF, WebP up to {formatFileSize(MAX_FILE_SIZE)}
          </p>

          <p className="text-xs text-muted-foreground">
            {currentCount}/{MAX_ATTACHMENTS_PER_PROMPT} attachments
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress, index) => (
            <div
              key={`${progress.fileName}-${index}`}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="flex-shrink-0">
                {progress.status === 'uploading' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : progress.status === 'complete' ? (
                  <ImageIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{progress.fileName}</p>
                {progress.status === 'uploading' && (
                  <Progress value={progress.progress} className="h-1 mt-1" />
                )}
                {progress.status === 'error' && (
                  <p className="text-xs text-destructive">{progress.error}</p>
                )}
              </div>

              <span className="text-xs text-muted-foreground">
                {progress.status === 'uploading'
                  ? `${Math.round(progress.progress)}%`
                  : progress.status === 'complete'
                  ? 'Done'
                  : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
