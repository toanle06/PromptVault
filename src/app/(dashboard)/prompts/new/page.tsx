'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PromptForm } from '@/components/prompts/prompt-form';
import { usePrompts } from '@/hooks/use-prompts';
import type { PromptFormData } from '@/types';

export default function NewPromptPage() {
  const router = useRouter();
  const { createPrompt, isLoading } = usePrompts();

  const handleSubmit = async (data: PromptFormData) => {
    const promptId = await createPrompt(data);
    if (promptId) {
      router.push(`/prompts/${promptId}`);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Prompt</CardTitle>
          <CardDescription>
            Add a new prompt to your library. Use {'{{variable_name}}'} syntax for dynamic variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
