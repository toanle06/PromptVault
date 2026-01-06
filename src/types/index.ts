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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PromptVariable {
  name: string;
  description?: string;
  defaultValue?: string;
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
