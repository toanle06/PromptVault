'use client';

import type { Prompt, Category, Tag, ExpertRole } from '@/types';

const DEMO_STORAGE_KEYS = {
  prompts: 'demo-prompts',
  categories: 'demo-categories',
  tags: 'demo-tags',
  expertRoles: 'demo-expert-roles',
  initialized: 'demo-initialized',
};

// Helper to get/set localStorage
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Generate unique ID
function generateId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get current timestamp as ISO string (for demo mode)
function getTimestamp(): string {
  return new Date().toISOString();
}

// ========================
// DEMO PROMPTS
// ========================

export function getDemoPrompts(): Prompt[] {
  return getStorage<Prompt[]>(DEMO_STORAGE_KEYS.prompts, []);
}

export function setDemoPrompts(prompts: Prompt[]): void {
  setStorage(DEMO_STORAGE_KEYS.prompts, prompts);
}

export function getDemoPrompt(promptId: string): Prompt | null {
  const prompts = getDemoPrompts();
  return prompts.find(p => p.id === promptId) || null;
}

export function createDemoPrompt(data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): string {
  const prompts = getDemoPrompts();
  const newPrompt: Prompt = {
    ...data,
    id: generateId(),
    usageCount: 0,
    createdAt: getTimestamp() as any,
    updatedAt: getTimestamp() as any,
  };
  prompts.unshift(newPrompt);
  setDemoPrompts(prompts);
  return newPrompt.id;
}

export function updateDemoPrompt(promptId: string, data: Partial<Prompt>): void {
  const prompts = getDemoPrompts();
  const index = prompts.findIndex(p => p.id === promptId);
  if (index !== -1) {
    prompts[index] = { ...prompts[index], ...data, updatedAt: getTimestamp() as any };
    setDemoPrompts(prompts);
  }
}

export function deleteDemoPrompt(promptId: string): void {
  const prompts = getDemoPrompts().filter(p => p.id !== promptId);
  setDemoPrompts(prompts);
}

// ========================
// DEMO CATEGORIES
// ========================

export function getDemoCategories(): Category[] {
  return getStorage<Category[]>(DEMO_STORAGE_KEYS.categories, []);
}

export function setDemoCategories(categories: Category[]): void {
  setStorage(DEMO_STORAGE_KEYS.categories, categories);
}

export function createDemoCategory(data: Omit<Category, 'id' | 'createdAt' | 'promptCount'>): string {
  const categories = getDemoCategories();
  const newCategory: Category = {
    ...data,
    id: generateId(),
    promptCount: 0,
    createdAt: getTimestamp() as any,
  };
  categories.push(newCategory);
  setDemoCategories(categories);
  return newCategory.id;
}

export function updateDemoCategory(categoryId: string, data: Partial<Category>): void {
  const categories = getDemoCategories();
  const index = categories.findIndex(c => c.id === categoryId);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...data };
    setDemoCategories(categories);
  }
}

export function deleteDemoCategory(categoryId: string): void {
  const categories = getDemoCategories().filter(c => c.id !== categoryId);
  setDemoCategories(categories);
}

// ========================
// DEMO TAGS
// ========================

export function getDemoTags(): Tag[] {
  return getStorage<Tag[]>(DEMO_STORAGE_KEYS.tags, []);
}

export function setDemoTags(tags: Tag[]): void {
  setStorage(DEMO_STORAGE_KEYS.tags, tags);
}

export function createDemoTag(data: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>): string {
  const tags = getDemoTags();
  const newTag: Tag = {
    ...data,
    id: generateId(),
    usageCount: 0,
    createdAt: getTimestamp() as any,
  };
  tags.push(newTag);
  setDemoTags(tags);
  return newTag.id;
}

export function updateDemoTag(tagId: string, data: Partial<Tag>): void {
  const tags = getDemoTags();
  const index = tags.findIndex(t => t.id === tagId);
  if (index !== -1) {
    tags[index] = { ...tags[index], ...data };
    setDemoTags(tags);
  }
}

export function deleteDemoTag(tagId: string): void {
  const tags = getDemoTags().filter(t => t.id !== tagId);
  setDemoTags(tags);
}

// ========================
// DEMO EXPERT ROLES
// ========================

export function getDemoExpertRoles(): ExpertRole[] {
  return getStorage<ExpertRole[]>(DEMO_STORAGE_KEYS.expertRoles, []);
}

export function setDemoExpertRoles(roles: ExpertRole[]): void {
  setStorage(DEMO_STORAGE_KEYS.expertRoles, roles);
}

export function createDemoExpertRole(data: Omit<ExpertRole, 'id' | 'createdAt'>): string {
  const roles = getDemoExpertRoles();
  const newRole: ExpertRole = {
    ...data,
    id: generateId(),
    createdAt: getTimestamp() as any,
  };
  roles.push(newRole);
  setDemoExpertRoles(roles);
  return newRole.id;
}

export function updateDemoExpertRole(roleId: string, data: Partial<ExpertRole>): void {
  const roles = getDemoExpertRoles();
  const index = roles.findIndex(r => r.id === roleId);
  if (index !== -1) {
    roles[index] = { ...roles[index], ...data };
    setDemoExpertRoles(roles);
  }
}

export function deleteDemoExpertRole(roleId: string): void {
  const roles = getDemoExpertRoles().filter(r => r.id !== roleId);
  setDemoExpertRoles(roles);
}

// ========================
// DEMO DATA INITIALIZATION
// ========================

export function isDemoInitialized(): boolean {
  return getStorage<boolean>(DEMO_STORAGE_KEYS.initialized, false);
}

export function initializeDemoData(): void {
  if (isDemoInitialized()) return;

  const timestamp = getTimestamp() as any;

  // Create categories
  const categories: Category[] = [
    { id: 'cat-ios', name: 'iOS Development', color: '#f97316', icon: 'smartphone', order: 0, parentId: '', promptCount: 0, createdAt: timestamp },
    { id: 'cat-web', name: 'Web Development', color: '#3b82f6', icon: 'globe', order: 1, parentId: '', promptCount: 0, createdAt: timestamp },
    { id: 'cat-uiux', name: 'UI/UX Design', color: '#a855f7', icon: 'palette', order: 2, parentId: '', promptCount: 0, createdAt: timestamp },
    { id: 'cat-backend', name: 'Backend', color: '#22c55e', icon: 'server', order: 3, parentId: '', promptCount: 0, createdAt: timestamp },
    { id: 'cat-review', name: 'Code Review', color: '#ef4444', icon: 'search', order: 4, parentId: '', promptCount: 0, createdAt: timestamp },
    // Subcategories
    { id: 'sub-swift', name: 'Swift', color: '#f97316', icon: '', order: 0, parentId: 'cat-ios', promptCount: 0, createdAt: timestamp },
    { id: 'sub-swiftui', name: 'SwiftUI', color: '#f97316', icon: '', order: 1, parentId: 'cat-ios', promptCount: 0, createdAt: timestamp },
    { id: 'sub-react', name: 'React', color: '#3b82f6', icon: '', order: 0, parentId: 'cat-web', promptCount: 0, createdAt: timestamp },
    { id: 'sub-vue', name: 'Vue.js', color: '#3b82f6', icon: '', order: 1, parentId: 'cat-web', promptCount: 0, createdAt: timestamp },
  ];

  // Create tags
  const tags: Tag[] = [
    { id: 'tag-prod', name: 'productivity', color: '#22c55e', usageCount: 0, createdAt: timestamp },
    { id: 'tag-debug', name: 'debugging', color: '#ef4444', usageCount: 0, createdAt: timestamp },
    { id: 'tag-arch', name: 'architecture', color: '#3b82f6', usageCount: 0, createdAt: timestamp },
    { id: 'tag-perf', name: 'performance', color: '#f59e0b', usageCount: 0, createdAt: timestamp },
    { id: 'tag-sec', name: 'security', color: '#dc2626', usageCount: 0, createdAt: timestamp },
    { id: 'tag-test', name: 'testing', color: '#8b5cf6', usageCount: 0, createdAt: timestamp },
    { id: 'tag-doc', name: 'documentation', color: '#6366f1', usageCount: 0, createdAt: timestamp },
    { id: 'tag-refac', name: 'refactoring', color: '#ec4899', usageCount: 0, createdAt: timestamp },
    { id: 'tag-best', name: 'best-practices', color: '#14b8a6', usageCount: 0, createdAt: timestamp },
  ];

  // Create expert roles
  const expertRoles: ExpertRole[] = [
    { id: 'role-ios', name: 'iOS Tech Lead', description: 'Senior iOS developer', experience: '12 years', createdAt: timestamp },
    { id: 'role-fe', name: 'Senior Frontend Developer', description: 'React and Vue specialist', experience: '8 years', createdAt: timestamp },
    { id: 'role-design', name: 'UI/UX Designer', description: 'Product designer', experience: '10 years', createdAt: timestamp },
    { id: 'role-backend', name: 'Backend Architect', description: 'System design expert', experience: '15 years', createdAt: timestamp },
    { id: 'role-review', name: 'Code Reviewer', description: 'Security focused', experience: '10 years', createdAt: timestamp },
  ];

  // Create sample prompts
  const prompts: Prompt[] = [
    {
      id: 'prompt-1',
      title: 'SwiftUI Component Builder',
      content: `Create a SwiftUI component for {{component_name}} with the following requirements:

1. Support both light and dark mode
2. Include proper accessibility labels
3. Use @Environment for color scheme detection
4. Follow Apple's Human Interface Guidelines
5. Include preview providers for different states

Component specifications:
- Purpose: {{purpose}}
- Input parameters: {{parameters}}
- Expected behavior: {{behavior}}

Please provide clean, production-ready code with comments.`,
      description: 'Generate SwiftUI components following best practices',
      categoryId: 'cat-ios',
      subcategoryId: 'sub-swiftui',
      expertRoleId: 'role-ios',
      tags: ['tag-prod', 'tag-best'],
      isFavorite: true,
      usageCount: 15,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'prompt-2',
      title: 'React Hook Generator',
      content: `Create a custom React hook called {{hook_name}} that:

Purpose: {{purpose}}

Requirements:
1. Follow React hooks best practices
2. Include proper TypeScript types
3. Handle loading, error, and success states
4. Include cleanup in useEffect if needed
5. Be reusable across components

Parameters: {{parameters}}
Return values: {{return_values}}

Please include the hook implementation, TypeScript interfaces, and usage example.`,
      description: 'Generate custom React hooks with TypeScript',
      categoryId: 'cat-web',
      subcategoryId: 'sub-react',
      expertRoleId: 'role-fe',
      tags: ['tag-prod', 'tag-test'],
      isFavorite: true,
      usageCount: 23,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'prompt-3',
      title: 'Code Review Checklist',
      content: `Review the following {{language}} code for:

\`\`\`{{language}}
{{code}}
\`\`\`

Please analyze for:

1. **Security Issues** - Input validation, SQL injection, XSS
2. **Performance** - Time complexity, memory usage
3. **Code Quality** - SOLID principles, DRY violations
4. **Testing** - Test coverage gaps, edge cases

Provide specific line numbers and suggestions for improvements.`,
      description: 'Comprehensive code review template',
      categoryId: 'cat-review',
      subcategoryId: '',
      expertRoleId: 'role-review',
      tags: ['tag-sec', 'tag-perf', 'tag-best'],
      isFavorite: true,
      usageCount: 31,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'prompt-4',
      title: 'Debug Helper',
      content: `I'm encountering the following error in my {{language}} application:

Error message:
\`\`\`
{{error_message}}
\`\`\`

Context:
- What I was trying to do: {{context}}
- Environment: {{environment}}
- Recent changes: {{recent_changes}}

Please help me:
1. Understand what's causing this error
2. Identify potential root causes
3. Provide step-by-step debugging approach
4. Suggest fixes with code examples`,
      description: 'Structured debugging assistance prompt',
      categoryId: 'cat-review',
      subcategoryId: '',
      expertRoleId: '',
      tags: ['tag-debug'],
      isFavorite: false,
      usageCount: 45,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'prompt-5',
      title: 'Unit Test Generator',
      content: `Generate unit tests for the following {{language}} code:

\`\`\`{{language}}
{{code}}
\`\`\`

Testing framework: {{framework}}

Please create tests that cover:
1. Happy path scenarios
2. Edge cases
3. Error conditions
4. Boundary values

Include test file setup, mocks/stubs, and meaningful assertions.`,
      description: 'Generate comprehensive unit tests',
      categoryId: 'cat-review',
      subcategoryId: '',
      expertRoleId: '',
      tags: ['tag-test', 'tag-best'],
      isFavorite: true,
      usageCount: 28,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  setDemoCategories(categories);
  setDemoTags(tags);
  setDemoExpertRoles(expertRoles);
  setDemoPrompts(prompts);
  setStorage(DEMO_STORAGE_KEYS.initialized, true);
}

// Clear all demo data
export function clearDemoData(): void {
  if (typeof window === 'undefined') return;
  Object.values(DEMO_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Export all demo data
export function exportDemoData() {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    prompts: getDemoPrompts(),
    categories: getDemoCategories(),
    tags: getDemoTags(),
    expertRoles: getDemoExpertRoles(),
  };
}
