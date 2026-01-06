'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrompts } from '@/hooks/use-prompts';
import { useCategories } from '@/hooks/use-categories';
import { useTags } from '@/hooks/use-tags';
import { useUIStore } from '@/store/ui-store';
import { PromptCard } from '@/components/prompts/prompt-card';
import {
  FileText,
  FolderOpen,
  Tags,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { prompts, filteredPrompts, isLoading: isLoadingPrompts } = usePrompts();
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { tags, isLoading: isLoadingTags } = useTags();
  const { setCreatePromptOpen } = useUIStore();

  const favoritePrompts = prompts.filter((p) => p.isFavorite);
  const recentPrompts = prompts.slice(0, 6);
  const mostUsedPrompts = [...prompts]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 3);

  const stats = [
    {
      title: 'Total Prompts',
      value: prompts.length,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Categories',
      value: categories.length,
      icon: FolderOpen,
      color: 'text-green-500',
    },
    {
      title: 'Tags',
      value: tags.length,
      icon: Tags,
      color: 'text-purple-500',
    },
    {
      title: 'Favorites',
      value: favoritePrompts.length,
      icon: Star,
      color: 'text-yellow-500',
    },
  ];

  const isLoading = isLoadingPrompts || isLoadingCategories || isLoadingTags;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your prompt library overview.
          </p>
        </div>
        <Button onClick={() => setCreatePromptOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Prompts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Prompts</CardTitle>
              <CardDescription>Your latest prompts</CardDescription>
            </div>
            <Link href="/prompts">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : recentPrompts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No prompts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first prompt to get started
                </p>
                <Button onClick={() => setCreatePromptOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Prompt
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Used */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Used
            </CardTitle>
            <CardDescription>Your top performing prompts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : mostUsedPrompts.length > 0 ? (
              <div className="space-y-4">
                {mostUsedPrompts.map((prompt, index) => (
                  <Link
                    key={prompt.id}
                    href={`/prompts/${prompt.id}`}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{prompt.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Used {prompt.usageCount} times
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No usage data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Favorites
            </CardTitle>
            <CardDescription>Quick access to your starred prompts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : favoritePrompts.length > 0 ? (
              <div className="space-y-2">
                {favoritePrompts.slice(0, 5).map((prompt) => (
                  <Link
                    key={prompt.id}
                    href={`/prompts/${prompt.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium truncate">{prompt.title}</span>
                  </Link>
                ))}
                {favoritePrompts.length > 5 && (
                  <Link
                    href="/prompts?favorites=true"
                    className="text-sm text-primary hover:underline block pt-2"
                  >
                    View all {favoritePrompts.length} favorites
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No favorites yet. Star prompts to add them here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
