'use client';

import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, Variable, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVariableDetection } from '@/hooks/use-template';
import { formatVariableName, syncVariablesWithContent } from '@/lib/utils/template-parser';
import type { PromptVariable } from '@/types';

interface VariableEditorProps {
  content: string;
  variables: PromptVariable[];
  onChange: (variables: PromptVariable[]) => void;
  className?: string;
}

export function VariableEditor({
  content,
  variables,
  onChange,
  className,
}: VariableEditorProps) {
  const { detectedVariables, hasVariables, variableCount } = useVariableDetection(content);

  // Sync variables when content changes
  useEffect(() => {
    if (!hasVariables) {
      if (variables.length > 0) {
        onChange([]);
      }
      return;
    }

    const synced = syncVariablesWithContent(content, variables);

    // Only update if there are actual changes
    const currentNames = variables.map((v) => v.name).sort().join(',');
    const syncedNames = synced.map((v) => v.name).sort().join(',');

    if (currentNames !== syncedNames) {
      onChange(synced);
    }
  }, [content, hasVariables]);

  const updateVariable = (index: number, updates: Partial<PromptVariable>) => {
    const newVariables = [...variables];
    newVariables[index] = { ...newVariables[index], ...updates };
    onChange(newVariables);
  };

  if (!hasVariables) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Variable className="h-4 w-4" />
          Template Variables
          <Badge variant="secondary" className="ml-1">
            {variableCount}
          </Badge>
        </Label>
      </div>

      <p className="text-sm text-muted-foreground">
        Configure the variables detected in your prompt. These will be fillable when using the prompt.
      </p>

      <div className="space-y-2">
        {variables.map((variable, index) => (
          <Card key={variable.name} className="overflow-hidden">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {`{{${variable.name}}}`}
                    </code>
                    {variable.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 pb-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`var-desc-${index}`} className="text-xs">
                        Description
                      </Label>
                      <Input
                        id={`var-desc-${index}`}
                        placeholder="What is this variable for?"
                        value={variable.description || ''}
                        onChange={(e) =>
                          updateVariable(index, { description: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Default Value */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`var-default-${index}`} className="text-xs">
                        Default Value
                      </Label>
                      <Input
                        id={`var-default-${index}`}
                        placeholder="Default value (optional)"
                        value={variable.defaultValue || ''}
                        onChange={(e) =>
                          updateVariable(index, { defaultValue: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Placeholder */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`var-placeholder-${index}`} className="text-xs">
                        Placeholder
                      </Label>
                      <Input
                        id={`var-placeholder-${index}`}
                        placeholder="Input placeholder text"
                        value={variable.placeholder || ''}
                        onChange={(e) =>
                          updateVariable(index, { placeholder: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Required Toggle */}
                    <div className="flex items-center justify-between space-y-0 pt-4">
                      <Label htmlFor={`var-required-${index}`} className="text-xs">
                        Required field
                      </Label>
                      <Switch
                        id={`var-required-${index}`}
                        checked={variable.required || false}
                        onCheckedChange={(checked) =>
                          updateVariable(index, { required: checked })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Variables are automatically detected from your prompt content. Use the format{' '}
          <code className="bg-primary/10 text-primary px-1 rounded">{'{{variable_name}}'}</code>{' '}
          to add new variables.
        </p>
      </div>
    </div>
  );
}
