'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/use-categories';
import { useTags } from '@/hooks/use-tags';
import { useExpertRoles } from '@/hooks/use-expert-roles';
import type { Prompt, PromptFormData, AIModel } from '@/types';
import { AI_MODELS } from '@/types';
import { X, Loader2, Bot } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  expertRoleId: z.string().optional(),
  tags: z.array(z.string()),
  isFavorite: z.boolean(),
  compatibleModels: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PromptFormProps {
  prompt?: Prompt;
  onSubmit: (data: PromptFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function PromptForm({ prompt, onSubmit, onCancel, isSubmitting }: PromptFormProps) {
  const { categories, categoriesTree } = useCategories();
  const { tags } = useTags();
  const { expertRoles } = useExpertRoles();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: prompt?.title || '',
      content: prompt?.content || '',
      description: prompt?.description || '',
      categoryId: prompt?.categoryId || '',
      subcategoryId: prompt?.subcategoryId || '',
      expertRoleId: prompt?.expertRoleId || '',
      tags: prompt?.tags || [],
      isFavorite: prompt?.isFavorite || false,
      compatibleModels: prompt?.compatibleModels || [],
    },
  });

  const selectedCategoryId = form.watch('categoryId');
  const selectedTags = form.watch('tags');
  const selectedModels = form.watch('compatibleModels') || [];

  // Get subcategories for selected category
  const subcategories = selectedCategoryId
    ? categoriesTree.subs[selectedCategoryId] || []
    : [];

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values as PromptFormData);
  };

  const handleAddTag = (tagId: string) => {
    const currentTags = form.getValues('tags');
    if (!currentTags.includes(tagId)) {
      form.setValue('tags', [...currentTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((t) => t !== tagId));
  };

  const handleAddModel = (model: string) => {
    const currentModels = form.getValues('compatibleModels') || [];
    if (!currentModels.includes(model)) {
      form.setValue('compatibleModels', [...currentModels, model]);
    }
  };

  const handleRemoveModel = (model: string) => {
    const currentModels = form.getValues('compatibleModels') || [];
    form.setValue('compatibleModels', currentModels.filter((m) => m !== model));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter prompt title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your prompt content..."
                  className="min-h-[200px] font-mono"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use {'{{variable_name}}'} for variables
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description or notes..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
                  value={field.value || '__none__'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {categoriesTree.main.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color || '#6366f1' }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subcategory */}
          <FormField
            control={form.control}
            name="subcategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategory</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
                  value={field.value || '__none__'}
                  disabled={!selectedCategoryId || subcategories.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Expert Role */}
        <FormField
          control={form.control}
          name="expertRoleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expert Role</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
                value={field.value || '__none__'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expert role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {expertRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.experience && ` (${role.experience})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-2">
                {/* Selected tags */}
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="cursor-pointer"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : undefined,
                          borderColor: tag.color || undefined,
                        }}
                        onClick={() => handleRemoveTag(tagId)}
                      >
                        {tag.name}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    );
                  })}
                </div>

                {/* Available tags */}
                <div className="flex flex-wrap gap-1">
                  {tags
                    .filter((tag) => !selectedTags.includes(tag.id))
                    .map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        style={{
                          borderColor: tag.color || undefined,
                          color: tag.color || undefined,
                        }}
                        onClick={() => handleAddTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AI Models */}
        <FormField
          control={form.control}
          name="compatibleModels"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Compatible AI Models
              </FormLabel>
              <FormDescription>
                Select which AI models this prompt works best with
              </FormDescription>
              <div className="space-y-3">
                {/* Selected models */}
                {selectedModels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedModels.map((modelValue) => {
                      const model = AI_MODELS.find((m) => m.value === modelValue);
                      if (!model) return null;
                      return (
                        <Badge
                          key={modelValue}
                          variant="secondary"
                          className="cursor-pointer"
                        >
                          {model.label}
                          <X className="ml-1 h-3 w-3" onClick={() => handleRemoveModel(modelValue)} />
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Text Models */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Text Models</p>
                  <div className="flex flex-wrap gap-1">
                    {AI_MODELS
                      .filter((model) => model.category === 'text' && !selectedModels.includes(model.value))
                      .map((model) => (
                        <Badge
                          key={model.value}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleAddModel(model.value)}
                        >
                          {model.label}
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Image Models */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Image Models</p>
                  <div className="flex flex-wrap gap-1">
                    {AI_MODELS
                      .filter((model) => model.category === 'image' && !selectedModels.includes(model.value))
                      .map((model) => (
                        <Badge
                          key={model.value}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleAddModel(model.value)}
                        >
                          {model.label}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : prompt ? (
              'Update Prompt'
            ) : (
              'Create Prompt'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
