'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { PromptForm } from '@/components/prompts/prompt-form';
import { usePrompts } from '@/hooks/use-prompts';
import { useCategories } from '@/hooks/use-categories';
import { useExpertRoles } from '@/hooks/use-expert-roles';
import { useTags } from '@/hooks/use-tags';
import type { PromptFormData } from '@/types';
import {
  ArrowLeft,
  Copy,
  Star,
  Edit,
  Trash2,
  Check,
  Calendar,
  BarChart3,
  Pin,
  PinOff,
  Copy as CopyIcon,
  Bot,
  History,
} from 'lucide-react';
import { AI_MODELS } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { VersionHistoryDialog } from '@/components/prompts/version-history-dialog';

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptId = params.id as string;
  const isEditMode = searchParams.get('edit') === 'true';

  const { prompts, updatePrompt, copyPrompt, toggleFavorite, togglePin, duplicatePrompt, softDeletePrompt, isLoading } = usePrompts();
  const { getCategoryById } = useCategories();
  const { getExpertRoleById } = useExpertRoles();
  const { getTagById } = useTags();

  const [isEditing, setIsEditing] = useState(isEditMode);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const prompt = prompts.find((p) => p.id === promptId);
  const category = prompt?.categoryId ? getCategoryById(prompt.categoryId) : null;
  const subcategory = prompt?.subcategoryId ? getCategoryById(prompt.subcategoryId) : null;
  const expertRole = prompt?.expertRoleId ? getExpertRoleById(prompt.expertRoleId) : null;

  useEffect(() => {
    setIsEditing(isEditMode);
  }, [isEditMode]);

  const handleUpdate = async (data: PromptFormData) => {
    await updatePrompt(promptId, data);
    setIsEditing(false);
    router.replace(`/prompts/${promptId}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await softDeletePrompt(promptId);
      router.push('/prompts');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handlePin = async () => {
    if (!prompt) return;
    await togglePin(promptId, !prompt.isPinned);
  };

  const handleDuplicate = async () => {
    const newId = await duplicatePrompt(promptId);
    if (newId) {
      router.push(`/prompts/${newId}`);
    }
  };

  const handleCopy = async () => {
    if (!prompt) return;
    await copyPrompt(promptId, prompt.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFavorite = async () => {
    if (!prompt) return;
    await toggleFavorite(promptId, !prompt.isFavorite);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    router.replace(`/prompts/${promptId}`);
  };

  // Loading state
  if (isLoading && !prompt) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-20" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found state
  if (!prompt) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Prompt not found</h2>
            <p className="text-muted-foreground mb-4">
              The prompt you&apos;re looking for doesn&apos;t exist or has been deleted.
            </p>
            <Button onClick={() => router.push('/prompts')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Prompts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createdAt = prompt.createdAt?.toDate?.() || new Date();
  const updatedAt = prompt.updatedAt?.toDate?.() || new Date();

  // Edit mode
  if (isEditing) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={handleCancelEdit}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel Edit
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <PromptForm
              prompt={prompt}
              onSubmit={handleUpdate}
              onCancel={handleCancelEdit}
              isSubmitting={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // View mode
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.push('/prompts')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Prompts
      </Button>

      {/* Main content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl">{prompt.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: category.color ? `${category.color}20` : undefined,
                      color: category.color || undefined,
                      borderColor: category.color || undefined,
                    }}
                  >
                    {category.name}
                    {subcategory && ` / ${subcategory.name}`}
                  </Badge>
                )}
                {expertRole && (
                  <Badge variant="outline">
                    {expertRole.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePin}
                title={prompt.isPinned ? 'Unpin' : 'Pin'}
              >
                {prompt.isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavorite}
                title={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={cn(
                    'h-4 w-4',
                    prompt.isFavorite && 'fill-yellow-500 text-yellow-500'
                  )}
                />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDuplicate}
                title="Duplicate prompt"
              >
                <CopyIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowVersionHistory(true)}
                title="Version History"
              >
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                title="Move to trash"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {prompt.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h3>
              <p className="text-sm">{prompt.description}</p>
            </div>
          )}

          {/* Content */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Prompt Content
            </h3>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono text-sm">
                {prompt.content}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {isCopied ? (
                  <>
                    <Check className="mr-1 h-3 w-3 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tagId) => {
                  const tag = getTagById(tagId);
                  if (!tag) return null;
                  return (
                    <Badge
                      key={tagId}
                      variant="outline"
                      style={{
                        borderColor: tag.color || undefined,
                        color: tag.color || undefined,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Models */}
          {prompt.compatibleModels && prompt.compatibleModels.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Compatible AI Models
              </h3>
              <div className="flex flex-wrap gap-2">
                {prompt.compatibleModels.map((modelValue) => {
                  const model = AI_MODELS.find((m) => m.value === modelValue);
                  if (!model) return null;
                  return (
                    <Badge
                      key={modelValue}
                      variant="secondary"
                    >
                      {model.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDistanceToNow(createdAt, { addSuffix: true })}</span>
            </div>
            {updatedAt > createdAt && (
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Used {prompt.usageCount} times</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to move &quot;{prompt.title}&quot; to trash?
              You can restore it later from the Trash page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Moving...' : 'Move to Trash'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Version History Dialog */}
      <VersionHistoryDialog
        promptId={promptId}
        promptTitle={prompt.title}
        currentVersion={prompt.version || 1}
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
      />
    </div>
  );
}
