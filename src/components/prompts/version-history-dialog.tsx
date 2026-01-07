'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrompts } from '@/hooks/use-prompts';
import type { PromptVersion } from '@/types';
import { History, RotateCcw, Eye, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VersionHistoryDialogProps {
  promptId: string;
  promptTitle: string;
  currentVersion?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionHistoryDialog({
  promptId,
  promptTitle,
  currentVersion = 1,
  open,
  onOpenChange,
}: VersionHistoryDialogProps) {
  const { getPromptVersions, restoreVersion } = usePrompts();
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<PromptVersion | null>(null);

  useEffect(() => {
    if (open && promptId) {
      loadVersions();
    }
  }, [open, promptId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const fetchedVersions = await getPromptVersions(promptId);
      setVersions(fetchedVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    setIsRestoring(true);
    try {
      await restoreVersion(promptId, selectedVersion.id);
      onOpenChange(false);
    } finally {
      setIsRestoring(false);
      setShowRestoreConfirm(false);
      setSelectedVersion(null);
    }
  };

  const initiateRestore = (version: PromptVersion) => {
    setSelectedVersion(version);
    setShowRestoreConfirm(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View and restore previous versions of "{promptTitle}"
              {currentVersion > 1 && (
                <Badge variant="secondary" className="ml-2">
                  Current: v{currentVersion}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No version history yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Version history will be created automatically when you edit this prompt.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => {
                  const createdAt = version.createdAt?.toDate?.() || new Date();

                  return (
                    <div
                      key={version.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">v{version.version}</Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <h4 className="font-medium line-clamp-1">{version.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {version.content.substring(0, 150)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewVersion(version)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => initiateRestore(version)}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Version Preview Dialog */}
      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview Version {previewVersion?.version}
            </DialogTitle>
          </DialogHeader>
          {previewVersion && (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Title</h4>
                  <p className="font-medium">{previewVersion.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Content</h4>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                    {previewVersion.content}
                  </pre>
                </div>
                {previewVersion.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm">{previewVersion.description}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setPreviewVersion(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (previewVersion) {
                initiateRestore(previewVersion);
                setPreviewVersion(null);
              }
            }}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore This Version
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version {selectedVersion?.version}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the prompt to version {selectedVersion?.version}. The current version
              will be saved in the history before restoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                'Restore'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
