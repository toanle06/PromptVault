'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PromptList } from '@/components/prompts/prompt-list';
import { usePrompts } from '@/hooks/use-prompts';
import { useUIStore } from '@/store/ui-store';
import { Plus } from 'lucide-react';

export default function PromptsPage() {
  const { filteredPrompts, isLoading } = usePrompts();
  const { setCreatePromptOpen } = useUIStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
          <p className="text-muted-foreground">
            Manage and organize your AI prompts
          </p>
        </div>
        <Button onClick={() => setCreatePromptOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {/* Prompts List */}
      <PromptList prompts={filteredPrompts} isLoading={isLoading} />
    </div>
  );
}
