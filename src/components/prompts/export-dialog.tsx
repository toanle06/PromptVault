'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Download, FileJson, FileText, FileCode, Loader2, Archive } from 'lucide-react';
import { useExport } from '@/hooks/use-export';
import type { Prompt, ExportFormat, ExportOptions } from '@/types';

interface ExportDialogProps {
  prompts: Prompt[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: 'json',
    label: 'JSON',
    description: 'Structured data format, ideal for importing elsewhere',
    icon: FileJson,
  },
  {
    value: 'markdown',
    label: 'Markdown',
    description: 'Formatted text with headers and code blocks',
    icon: FileCode,
  },
  {
    value: 'text',
    label: 'Plain Text',
    description: 'Simple text format, easy to read and share',
    icon: FileText,
  },
];

export function ExportDialog({ prompts, open, onOpenChange }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [options, setOptions] = useState<Omit<ExportOptions, 'format'>>({
    includeMetadata: true,
    includeVariables: true,
  });

  const { isExporting, exportSingle, exportMultiple } = useExport({
    onSuccess: () => onOpenChange(false),
  });

  const handleExport = async () => {
    const exportOptions: ExportOptions = {
      format,
      ...options,
    };

    if (prompts.length === 1) {
      await exportSingle(prompts[0], format, exportOptions);
    } else {
      await exportMultiple(prompts, format, exportOptions);
    }
  };

  const isBulk = prompts.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {isBulk ? 'Prompts' : 'Prompt'}
          </DialogTitle>
          <DialogDescription>
            {isBulk ? (
              <>
                Export <Badge variant="secondary">{prompts.length}</Badge> selected prompts
                {prompts.length > 1 && ' as a ZIP archive'}
              </>
            ) : (
              <>Export &ldquo;{prompts[0]?.title}&rdquo;</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="space-y-2"
            >
              {FORMAT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                      ${format === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                      }`}
                  >
                    <RadioGroupItem value={option.value} className="mt-0.5" />
                    <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Options</Label>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="text-sm font-medium">Include Metadata</div>
                <div className="text-xs text-muted-foreground">
                  Tags, dates, usage count, compatible models
                </div>
              </div>
              <Switch
                checked={options.includeMetadata}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, includeMetadata: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <div className="text-sm font-medium">Include Variables</div>
                <div className="text-xs text-muted-foreground">
                  Template variable definitions
                </div>
              </div>
              <Switch
                checked={options.includeVariables}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, includeVariables: checked }))
                }
              />
            </div>
          </div>

          {/* ZIP indicator for bulk export */}
          {isBulk && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <Archive className="h-4 w-4" />
              <span>
                Multiple prompts will be exported as a ZIP archive containing{' '}
                {prompts.length} files
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
