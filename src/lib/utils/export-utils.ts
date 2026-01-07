import JSZip from 'jszip';
import type { Prompt, ExportFormat, ExportOptions, PromptVariable } from '@/types';

/**
 * Convert a prompt to JSON format
 */
export function promptToJson(prompt: Prompt, options: ExportOptions): string {
  const data: Record<string, unknown> = {
    title: prompt.title,
    content: prompt.content,
  };

  if (options.includeMetadata) {
    data.description = prompt.description || '';
    data.tags = prompt.tags;
    data.isFavorite = prompt.isFavorite;
    data.usageCount = prompt.usageCount;
    data.compatibleModels = prompt.compatibleModels || [];
    data.createdAt = prompt.createdAt?.toDate?.()?.toISOString() || new Date().toISOString();
    data.updatedAt = prompt.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString();
  }

  if (options.includeVariables && prompt.variables && prompt.variables.length > 0) {
    data.variables = prompt.variables;
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Convert a prompt to Markdown format
 */
export function promptToMarkdown(prompt: Prompt, options: ExportOptions): string {
  const lines: string[] = [];

  // Title
  lines.push(`# ${prompt.title}`);
  lines.push('');

  // Description
  if (prompt.description) {
    lines.push(prompt.description);
    lines.push('');
  }

  // Prompt content
  lines.push('## Prompt');
  lines.push('');
  lines.push('```');
  lines.push(prompt.content);
  lines.push('```');
  lines.push('');

  // Variables
  if (options.includeVariables && prompt.variables && prompt.variables.length > 0) {
    lines.push('## Variables');
    lines.push('');
    lines.push('| Variable | Description | Default | Required |');
    lines.push('|----------|-------------|---------|----------|');
    for (const variable of prompt.variables) {
      const desc = variable.description || '-';
      const def = variable.defaultValue || '-';
      const req = variable.required ? 'Yes' : 'No';
      lines.push(`| \`{{${variable.name}}}\` | ${desc} | ${def} | ${req} |`);
    }
    lines.push('');
  }

  // Metadata
  if (options.includeMetadata) {
    lines.push('## Metadata');
    lines.push('');

    const createdAt = prompt.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || 'Unknown';
    const updatedAt = prompt.updatedAt?.toDate?.()?.toISOString()?.split('T')[0] || 'Unknown';

    lines.push(`- **Created:** ${createdAt}`);
    lines.push(`- **Updated:** ${updatedAt}`);
    lines.push(`- **Usage Count:** ${prompt.usageCount}`);

    if (prompt.isFavorite) {
      lines.push('- **Favorite:** Yes');
    }

    if (prompt.compatibleModels && prompt.compatibleModels.length > 0) {
      lines.push(`- **Compatible Models:** ${prompt.compatibleModels.join(', ')}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Convert a prompt to plain text format
 */
export function promptToText(prompt: Prompt, options: ExportOptions): string {
  const lines: string[] = [];

  lines.push(`Title: ${prompt.title}`);
  lines.push('---');
  lines.push(prompt.content);

  if (options.includeMetadata) {
    lines.push('');
    lines.push('---');
    if (prompt.description) {
      lines.push(`Description: ${prompt.description}`);
    }
    const createdAt = prompt.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || 'Unknown';
    lines.push(`Created: ${createdAt}`);
    lines.push(`Usage: ${prompt.usageCount} times`);
  }

  if (options.includeVariables && prompt.variables && prompt.variables.length > 0) {
    lines.push('');
    lines.push('Variables:');
    for (const variable of prompt.variables) {
      const req = variable.required ? ' (required)' : '';
      const def = variable.defaultValue ? ` = "${variable.defaultValue}"` : '';
      lines.push(`  - {{${variable.name}}}${req}${def}`);
    }
  }

  return lines.join('\n');
}

/**
 * Convert a prompt to the specified format
 */
export function promptToFormat(
  prompt: Prompt,
  format: ExportFormat,
  options: ExportOptions
): string {
  switch (format) {
    case 'json':
      return promptToJson(prompt, options);
    case 'markdown':
      return promptToMarkdown(prompt, options);
    case 'text':
      return promptToText(prompt, options);
    default:
      return promptToText(prompt, options);
  }
}

/**
 * Get file extension for format
 */
export function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'json':
      return 'json';
    case 'markdown':
      return 'md';
    case 'text':
      return 'txt';
    default:
      return 'txt';
  }
}

/**
 * Get MIME type for format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'json':
      return 'application/json';
    case 'markdown':
      return 'text/markdown';
    case 'text':
      return 'text/plain';
    default:
      return 'text/plain';
  }
}

/**
 * Sanitize filename for safe file system usage
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '-')
    .replace(/_+/g, '_')
    .slice(0, 100);
}

/**
 * Download a single file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Download a single prompt as a file
 */
export function downloadPrompt(
  prompt: Prompt,
  format: ExportFormat,
  options: ExportOptions
): void {
  const content = promptToFormat(prompt, format, options);
  const extension = getFileExtension(format);
  const mimeType = getMimeType(format);
  const filename = `${sanitizeFilename(prompt.title)}.${extension}`;

  downloadFile(content, filename, mimeType);
}

/**
 * Create a ZIP file containing multiple prompts
 */
export async function createPromptsZip(
  prompts: Prompt[],
  format: ExportFormat,
  options: ExportOptions
): Promise<Blob> {
  const zip = new JSZip();
  const extension = getFileExtension(format);

  // Track filenames to avoid duplicates
  const usedNames = new Set<string>();

  for (const prompt of prompts) {
    const content = promptToFormat(prompt, format, options);
    let baseName = sanitizeFilename(prompt.title);
    let filename = `${baseName}.${extension}`;

    // Handle duplicate filenames
    let counter = 1;
    while (usedNames.has(filename)) {
      filename = `${baseName}_${counter}.${extension}`;
      counter++;
    }
    usedNames.add(filename);

    zip.file(filename, content);
  }

  return zip.generateAsync({ type: 'blob' });
}

/**
 * Download multiple prompts as a ZIP file
 */
export async function downloadPromptsZip(
  prompts: Prompt[],
  format: ExportFormat,
  options: ExportOptions
): Promise<void> {
  const blob = await createPromptsZip(prompts, format, options);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `prompts_${timestamp}.zip`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export all prompts as a single JSON file (for backup)
 */
export function exportAllAsJson(prompts: Prompt[]): string {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    count: prompts.length,
    prompts: prompts.map((prompt) => ({
      title: prompt.title,
      content: prompt.content,
      description: prompt.description || '',
      tags: prompt.tags,
      isFavorite: prompt.isFavorite,
      usageCount: prompt.usageCount,
      compatibleModels: prompt.compatibleModels || [],
      variables: prompt.variables || [],
      createdAt: prompt.createdAt?.toDate?.()?.toISOString(),
      updatedAt: prompt.updatedAt?.toDate?.()?.toISOString(),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download all prompts as a backup JSON file
 */
export function downloadBackup(prompts: Prompt[]): void {
  const content = exportAllAsJson(prompts);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `promptvault_backup_${timestamp}.json`;

  downloadFile(content, filename, 'application/json');
}
