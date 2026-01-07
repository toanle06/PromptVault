'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, RotateCcw, Variable, Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTemplate } from '@/hooks/use-template';
import { formatVariableName } from '@/lib/utils/template-parser';
import type { Prompt } from '@/types';

interface VariableFillerDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VariableFillerDialog({
  prompt,
  open,
  onOpenChange,
}: VariableFillerDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'fill' | 'preview'>('fill');

  const {
    variables,
    values,
    setValue,
    resetValues,
    clearValues,
    saveValues,
    filledContent,
    validation,
    isComplete,
    unfilledVariables,
  } = useTemplate(prompt);

  // Reset copy state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsCopied(false);
      setActiveTab('fill');
    }
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(filledContent);
      setIsCopied(true);
      saveValues(); // Save values for next time
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyAndClose = async () => {
    await handleCopy();
    setTimeout(() => onOpenChange(false), 500);
  };

  if (!prompt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Variable className="h-5 w-5" />
            Use Template: {prompt.title}
          </DialogTitle>
          <DialogDescription>
            Fill in the variables below to generate your customized prompt.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'fill' | 'preview')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fill" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fill Variables
              {unfilledVariables.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unfilledVariables.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fill" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {variables.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Variable className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No variables detected in this prompt.</p>
                  </div>
                ) : (
                  variables.map((variable) => {
                    const isEmpty = !values[variable.name];
                    const isMissing = variable.required && isEmpty;

                    return (
                      <div key={variable.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={`var-${variable.name}`}
                            className="flex items-center gap-2"
                          >
                            <code className="text-sm font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {`{{${variable.name}}}`}
                            </code>
                            {variable.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </Label>
                          {variable.description && (
                            <span className="text-xs text-muted-foreground">
                              {variable.description}
                            </span>
                          )}
                        </div>
                        <Input
                          id={`var-${variable.name}`}
                          placeholder={
                            variable.placeholder ||
                            `Enter ${formatVariableName(variable.name)}...`
                          }
                          value={values[variable.name] || ''}
                          onChange={(e) => setValue(variable.name, e.target.value)}
                          className={cn(
                            isMissing && 'border-destructive focus-visible:ring-destructive'
                          )}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Validation message */}
            {!validation.valid && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  Missing required fields: {validation.missing.join(', ')}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="relative">
              <ScrollArea className="h-[400px]">
                <pre className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {filledContent}
                </pre>
              </ScrollArea>

              {/* Unfilled variables indicator */}
              {unfilledVariables.length > 0 && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {unfilledVariables.length} unfilled
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={resetValues}
              title="Reset to default values"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearValues}
              title="Clear all values"
            >
              Clear
            </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopy} disabled={isCopied}>
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button onClick={handleCopyAndClose} variant="default">
              Copy & Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
