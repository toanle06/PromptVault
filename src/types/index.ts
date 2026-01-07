// PromptVault Type Definitions
// Based on BRD Section 8.2 - Collections Structure

import { Timestamp } from 'firebase/firestore';

// User Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences?: UserPreferences;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'grid' | 'list';
  promptsPerPage: number;
}

// AI Model Types
export type AIModel =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'copilot'
  | 'perplexity'
  | 'llama'
  | 'mistral'
  | 'grok'
  | 'midjourney'
  | 'dall-e'
  | 'stable-diffusion'
  | 'ideogram'
  | 'flux'
  | 'leonardo'
  | 'google-veo'
  | 'runway'
  | 'pika'
  | 'sora'
  | 'kling'
  | 'other';

export const AI_MODELS: { value: AIModel; label: string; category: 'text' | 'image' | 'video' }[] = [
  // Text Models
  { value: 'chatgpt', label: 'ChatGPT', category: 'text' },
  { value: 'claude', label: 'Claude', category: 'text' },
  { value: 'gemini', label: 'Gemini', category: 'text' },
  { value: 'copilot', label: 'Copilot', category: 'text' },
  { value: 'perplexity', label: 'Perplexity', category: 'text' },
  { value: 'llama', label: 'Llama', category: 'text' },
  { value: 'mistral', label: 'Mistral', category: 'text' },
  { value: 'grok', label: 'Grok', category: 'text' },
  // Image Models
  { value: 'midjourney', label: 'Midjourney', category: 'image' },
  { value: 'dall-e', label: 'DALL-E', category: 'image' },
  { value: 'stable-diffusion', label: 'Stable Diffusion', category: 'image' },
  { value: 'ideogram', label: 'Ideogram', category: 'image' },
  { value: 'flux', label: 'Flux', category: 'image' },
  { value: 'leonardo', label: 'Leonardo', category: 'image' },
  // Video Models
  { value: 'google-veo', label: 'Google Veo', category: 'video' },
  { value: 'runway', label: 'Runway', category: 'video' },
  { value: 'pika', label: 'Pika', category: 'video' },
  { value: 'sora', label: 'Sora', category: 'video' },
  { value: 'kling', label: 'Kling', category: 'video' },
  // Other
  { value: 'other', label: 'Other', category: 'text' },
];

// Prompt Types
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  expertRoleId?: string;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  variables?: PromptVariable[];
  // Sprint 1: New fields
  isPinned?: boolean;
  pinnedAt?: Timestamp;
  compatibleModels?: AIModel[];
  isDeleted?: boolean;
  deletedAt?: Timestamp;
  // Sprint 2: Version history
  version?: number;
  // Note: These can be null during latency compensation (before server confirmation)
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

// Sprint 2: Version History Types
export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  title: string;
  content: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  expertRoleId?: string;
  tags: string[];
  compatibleModels?: AIModel[];
  changeNote?: string;
  createdAt: Timestamp;
  createdBy?: string;
}

export interface PromptVariable {
  name: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}

export interface PromptFormData {
  title: string;
  content: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  expertRoleId?: string;
  tags: string[];
  isFavorite?: boolean;
  compatibleModels?: AIModel[];
  variables?: PromptVariable[];
  isTemplate?: boolean;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order: number;
  promptCount: number;
  createdAt: Timestamp;
}

export interface CategoryFormData {
  name: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order?: number;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  color?: string;
  usageCount: number;
  createdAt: Timestamp;
}

export interface TagFormData {
  name: string;
  color?: string;
}

// Expert Role Types
export interface ExpertRole {
  id: string;
  name: string;
  experience?: string;
  description?: string;
  systemPrompt?: string;
  promptPrefix?: string;
  isSystem?: boolean;
  createdAt: Timestamp;
}

export interface ExpertRoleFormData {
  name: string;
  experience?: string;
  description?: string;
  systemPrompt?: string;
}

// Filter & Search Types
export interface PromptFilters {
  categoryId?: string;
  subcategoryId?: string;
  tags?: string[];
  expertRoleId?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
  searchQuery?: string;
}

export interface SortOptions {
  field: 'createdAt' | 'updatedAt' | 'title' | 'usageCount';
  direction: 'asc' | 'desc';
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  isSearchOpen: boolean;
  selectedPromptId?: string;
}

// Export/Import Types
export interface ExportData {
  version: string;
  exportedAt: string;
  prompts: Prompt[];
  categories: Category[];
  tags: Tag[];
  expertRoles: ExpertRole[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Sample Data Types (for seeding)
export interface SamplePrompt {
  title: string;
  content: string;
  description: string;
  categoryName: string;
  expertRoleName?: string;
  tags: string[];
}

// Sprint 2: Bulk Operations Types
export type BulkAction =
  | 'delete'
  | 'restore'
  | 'favorite'
  | 'unfavorite'
  | 'pin'
  | 'unpin'
  | 'addTag'
  | 'removeTag'
  | 'moveToCategory'
  | 'permanentDelete';

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors?: string[];
}

// Sprint 2: Keyboard Shortcuts Types
export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: string;
  description: string;
  scope?: 'global' | 'list' | 'detail' | 'form';
}

// Sprint 3: Prompt Attachments Types
export interface PromptAttachment {
  id: string;
  promptId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  order: number;
  type: 'image' | 'document' | 'other';
  createdAt: Timestamp;
}

export interface AttachmentUploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

// Attachment Constants
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENTS_PER_PROMPT = 10;

// Sprint 3: Export Types
export type ExportFormat = 'json' | 'markdown' | 'text';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  includeVariables: boolean;
}

// Sprint 3: Variable Values for Templates
export interface VariableValues {
  [variableName: string]: string;
}
