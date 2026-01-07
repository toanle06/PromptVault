'use client';

import { useState, useCallback } from 'react';
import type { Prompt, ExportFormat, ExportOptions } from '@/types';
import {
  downloadPrompt,
  downloadPromptsZip,
  downloadBackup,
} from '@/lib/utils/export-utils';
import { toast } from 'sonner';

interface UseExportOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useExport(hookOptions?: UseExportOptions) {
  const [isExporting, setIsExporting] = useState(false);

  const exportSingle = useCallback(
    async (prompt: Prompt, format: ExportFormat, options: ExportOptions) => {
      setIsExporting(true);
      try {
        downloadPrompt(prompt, format, options);
        toast.success(`Exported "${prompt.title}" as ${format.toUpperCase()}`);
        hookOptions?.onSuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Export failed');
        toast.error(`Failed to export: ${err.message}`);
        hookOptions?.onError?.(err);
      } finally {
        setIsExporting(false);
      }
    },
    [hookOptions]
  );

  const exportMultiple = useCallback(
    async (prompts: Prompt[], format: ExportFormat, options: ExportOptions) => {
      if (prompts.length === 0) {
        toast.error('No prompts to export');
        return;
      }

      // Single prompt - export directly
      if (prompts.length === 1) {
        return exportSingle(prompts[0], format, options);
      }

      setIsExporting(true);
      try {
        await downloadPromptsZip(prompts, format, options);
        toast.success(`Exported ${prompts.length} prompts as ZIP`);
        hookOptions?.onSuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Export failed');
        toast.error(`Failed to export: ${err.message}`);
        hookOptions?.onError?.(err);
      } finally {
        setIsExporting(false);
      }
    },
    [exportSingle, hookOptions]
  );

  const exportBackup = useCallback(
    async (prompts: Prompt[]) => {
      if (prompts.length === 0) {
        toast.error('No prompts to backup');
        return;
      }

      setIsExporting(true);
      try {
        downloadBackup(prompts);
        toast.success(`Backed up ${prompts.length} prompts`);
        hookOptions?.onSuccess?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Backup failed');
        toast.error(`Failed to backup: ${err.message}`);
        hookOptions?.onError?.(err);
      } finally {
        setIsExporting(false);
      }
    },
    [hookOptions]
  );

  return {
    isExporting,
    exportSingle,
    exportMultiple,
    exportBackup,
  };
}
