'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PromptForm } from './prompt-form';
import { usePrompts } from '@/hooks/use-prompts';
import { useUIStore } from '@/store/ui-store';
import type { PromptFormData } from '@/types';

export function CreatePromptDialog() {
  const router = useRouter();
  const { createPrompt, isLoading } = usePrompts();
  const { isCreatePromptOpen: createPromptOpen, setCreatePromptOpen } = useUIStore();

  const handleSubmit = async (data: PromptFormData) => {
    const promptId = await createPrompt(data);
    if (promptId) {
      setCreatePromptOpen(false);
      router.push(`/prompts/${promptId}`);
    }
  };

  const handleCancel = () => {
    setCreatePromptOpen(false);
  };

  return (
    <Dialog open={createPromptOpen} onOpenChange={setCreatePromptOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
          <DialogDescription>
            Add a new prompt to your library. Use {'{{variable_name}}'} syntax for dynamic variables.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1 -mx-1">
        <PromptForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isLoading}
        />
        </div>
      </DialogContent>
    </Dialog>
  );
}
