'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface PromptCardProps {
  prompt: Prompt;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { copyPrompt, toggleFavorite } = usePrompts();
  const { getCategoryById } = useCategories();
  const { getExpertRoleById } = useExpertRoles();
  const { getTagById } = useTags();

  const category = prompt.categoryId ? getCategoryById(prompt.categoryId) : null;
  const expertRole = prompt.expertRoleId ? getExpertRoleById(prompt.expertRoleId) : null;

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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(prompt);
  };

  const createdAt = prompt.createdAt?.toDate?.() || new Date();

  return (
    <Link href={`/prompts/${prompt.id}`}>
      <Card className="group h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {prompt.title}
              </h3>
              {category && (
                <Badge
                  variant="secondary"
                  className="mt-1"
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {prompt.content}
          </p>

          {expertRole && (
            <Badge variant="outline" className="mt-2">
              {expertRole.name}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="pt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {prompt.tags.slice(0, 3).map((tagId) => {
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
            {prompt.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleFavorite}
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  prompt.isFavorite && 'fill-yellow-500 text-yellow-500'
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
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
    </Link>
  );
}
