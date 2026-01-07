'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePrompts } from '@/hooks/use-prompts';
import { useCategories } from '@/hooks/use-categories';
import { useExpertRoles } from '@/hooks/use-expert-roles';
import { useTags } from '@/hooks/use-tags';
import type { Prompt } from '@/types';
import {
  Copy,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  ExternalLink,
  Pin,
  PinOff,
  Copy as CopyIcon,
  Bot,
  Variable,
  Download,
} from 'lucide-react';
import { AI_MODELS } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { hasVariables } from '@/lib/utils/template-parser';
import { ExportDialog } from './export-dialog';

interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (promptId: string, selected: boolean) => void;
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onSelectionChange,
}: PromptCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { copyPrompt, toggleFavorite, togglePin, duplicatePrompt, softDeletePrompt } = usePrompts();
  const { getCategoryById } = useCategories();
  const { getExpertRoleById } = useExpertRoles();
  const { getTagById } = useTags();

  const category = prompt.categoryId ? getCategoryById(prompt.categoryId) : null;
  const expertRole = prompt.expertRoleId ? getExpertRoleById(prompt.expertRoleId) : null;
  const isTemplate = hasVariables(prompt.content);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await copyPrompt(prompt.id, prompt.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(prompt.id, !prompt.isFavorite);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(prompt);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await softDeletePrompt(prompt.id);
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await togglePin(prompt.id, !prompt.isPinned);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await duplicatePrompt(prompt.id);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowExportDialog(true);
  };

  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectionChange?.(prompt.id, !isSelected);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      onSelectionChange?.(prompt.id, !isSelected);
    }
  };

  const createdAt = prompt.createdAt?.toDate?.() || new Date();

  const cardContent = (
    <Card
      className={cn(
        "group h-full hover:shadow-md transition-shadow cursor-pointer",
        prompt.isPinned && "ring-2 ring-primary/50 bg-primary/5",
        isSelected && "ring-2 ring-primary bg-primary/10"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          {isSelectionMode && (
            <div className="pt-1" onClick={handleSelectionToggle}>
              <Checkbox
                checked={isSelected}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {prompt.isPinned && (
                <Pin className="h-4 w-4 text-primary flex-shrink-0" />
              )}
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {prompt.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {isTemplate && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  <Variable className="mr-1 h-3 w-3" />
                  Template
                </Badge>
              )}
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
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`More actions for ${prompt.title}`}
              >
                <MoreVertical className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" aria-label="Prompt actions">
              <DropdownMenuItem onClick={handlePin}>
                {prompt.isPinned ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <CopyIcon className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {prompt.content}
        </p>

        <div className="flex flex-wrap gap-1 mt-2">
          {expertRole && (
            <Badge variant="outline">
              {expertRole.name}
            </Badge>
          )}
          {prompt.compatibleModels && prompt.compatibleModels.length > 0 && (
            <>
              {prompt.compatibleModels.slice(0, 2).map((modelValue) => {
                const model = AI_MODELS.find((m) => m.value === modelValue);
                if (!model) return null;
                return (
                  <Badge
                    key={modelValue}
                    variant="outline"
                    className="text-xs bg-muted/50"
                  >
                    <Bot className="mr-1 h-3 w-3" />
                    {model.label}
                  </Badge>
                );
              })}
              {prompt.compatibleModels.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{prompt.compatibleModels.length - 2}
                </Badge>
              )}
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {(prompt.tags || []).slice(0, 3).map((tagId) => {
            const tag = getTagById(tagId);
            if (!tag) return null;
            return (
              <Badge
                key={tagId}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: tag.color || undefined,
                  color: tag.color || undefined,
                }}
              >
                {tag.name}
              </Badge>
            );
          })}
          {(prompt.tags?.length || 0) > 3 && (
            <Badge variant="outline" className="text-xs">
              +{(prompt.tags?.length || 0) - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleFavorite}
            aria-label={prompt.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={prompt.isFavorite}
          >
            <Star
              className={cn(
                'h-4 w-4',
                prompt.isFavorite && 'fill-yellow-500 text-yellow-500'
              )}
              aria-hidden="true"
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            aria-label={isCopied ? 'Copied to clipboard' : 'Copy prompt to clipboard'}
          >
            {isCopied ? (
              <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </CardFooter>

      <div className="px-6 pb-3">
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(createdAt, { addSuffix: true })}
          {prompt.usageCount > 0 && ` • Used ${prompt.usageCount} times`}
        </p>
      </div>
    </Card>
  );

  // In selection mode, don't wrap with Link
  if (isSelectionMode) {
    return (
      <>
        {cardContent}
        <ExportDialog
          prompts={[prompt]}
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
        />
      </>
    );
  }

  return (
    <>
      <Link href={`/prompts/${prompt.id}`}>{cardContent}</Link>
      <ExportDialog
        prompts={[prompt]}
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
    </>
  );
}
