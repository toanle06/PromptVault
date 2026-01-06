import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  Unsubscribe,
  Firestore,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Prompt,
  PromptFormData,
  Category,
  Tag,
  ExpertRole,
  PromptFilters,
  SortOptions,
} from '@/types';

// Helper to get Firestore instance with null check
function getDb(): Firestore {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized. Make sure you have configured Firebase correctly and are running in a browser environment.');
  }
  return db;
}

// Helper to get user's collection path
const getUserCollection = (userId: string, collectionName: string) =>
  collection(getDb(), 'users', userId, collectionName);

// ========================
// PROMPT OPERATIONS
// ========================

export async function getPrompts(userId: string): Promise<Prompt[]> {
  const promptsRef = getUserCollection(userId, 'prompts');
  const q = query(promptsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Prompt));
}

export async function getPrompt(userId: string, promptId: string): Promise<Prompt | null> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  const snapshot = await getDoc(promptRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Prompt;
  }
  return null;
}

export async function createPrompt(userId: string, data: PromptFormData): Promise<string> {
  const promptsRef = getUserCollection(userId, 'prompts');
  const promptData = {
    ...data,
    isFavorite: data.isFavorite || false,
    usageCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(promptsRef, promptData);
  return docRef.id;
}

export async function updatePrompt(
  userId: string,
  promptId: string,
  data: Partial<PromptFormData>
): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  await updateDoc(promptRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePrompt(userId: string, promptId: string): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  await deleteDoc(promptRef);
}

export async function toggleFavorite(userId: string, promptId: string, isFavorite: boolean): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  await updateDoc(promptRef, { isFavorite, updatedAt: serverTimestamp() });
}

export async function incrementUsageCount(userId: string, promptId: string): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  const snapshot = await getDoc(promptRef);
  if (snapshot.exists()) {
    const currentCount = snapshot.data().usageCount || 0;
    await updateDoc(promptRef, { usageCount: currentCount + 1 });
  }
}

// Real-time subscription for prompts
export function subscribeToPrompts(
  userId: string,
  callback: (prompts: Prompt[]) => void
): Unsubscribe {
  const promptsRef = getUserCollection(userId, 'prompts');
  const q = query(promptsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const prompts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Prompt));
    callback(prompts);
  });
}

// ========================
// CATEGORY OPERATIONS
// ========================

export async function getCategories(userId: string): Promise<Category[]> {
  const categoriesRef = getUserCollection(userId, 'categories');
  const q = query(categoriesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
}

export async function createCategory(
  userId: string,
  data: Omit<Category, 'id' | 'createdAt' | 'promptCount'>
): Promise<string> {
  const categoriesRef = getUserCollection(userId, 'categories');
  const categoryData = {
    ...data,
    promptCount: 0,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(categoriesRef, categoryData);
  return docRef.id;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: Partial<Category>
): Promise<void> {
  const categoryRef = doc(getDb(), 'users', userId, 'categories', categoryId);
  await updateDoc(categoryRef, data);
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  const categoryRef = doc(getDb(), 'users', userId, 'categories', categoryId);
  await deleteDoc(categoryRef);
}

// Real-time subscription for categories
export function subscribeToCategories(
  userId: string,
  callback: (categories: Category[]) => void
): Unsubscribe {
  const categoriesRef = getUserCollection(userId, 'categories');
  const q = query(categoriesRef, orderBy('order', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
    callback(categories);
  });
}

// ========================
// TAG OPERATIONS
// ========================

export async function getTags(userId: string): Promise<Tag[]> {
  const tagsRef = getUserCollection(userId, 'tags');
  const q = query(tagsRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Tag));
}

export async function createTag(
  userId: string,
  data: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>
): Promise<string> {
  const tagsRef = getUserCollection(userId, 'tags');
  const tagData = {
    ...data,
    usageCount: 0,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(tagsRef, tagData);
  return docRef.id;
}

export async function updateTag(
  userId: string,
  tagId: string,
  data: Partial<Tag>
): Promise<void> {
  const tagRef = doc(getDb(), 'users', userId, 'tags', tagId);
  await updateDoc(tagRef, data);
}

export async function deleteTag(userId: string, tagId: string): Promise<void> {
  const tagRef = doc(getDb(), 'users', userId, 'tags', tagId);
  await deleteDoc(tagRef);
}

// Real-time subscription for tags
export function subscribeToTags(
  userId: string,
  callback: (tags: Tag[]) => void
): Unsubscribe {
  const tagsRef = getUserCollection(userId, 'tags');
  const q = query(tagsRef, orderBy('name', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const tags = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Tag));
    callback(tags);
  });
}

// ========================
// EXPERT ROLE OPERATIONS
// ========================

export async function getExpertRoles(userId: string): Promise<ExpertRole[]> {
  const rolesRef = getUserCollection(userId, 'expertRoles');
  const q = query(rolesRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ExpertRole));
}

export async function createExpertRole(
  userId: string,
  data: Omit<ExpertRole, 'id' | 'createdAt'>
): Promise<string> {
  const rolesRef = getUserCollection(userId, 'expertRoles');
  const roleData = {
    ...data,
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(rolesRef, roleData);
  return docRef.id;
}

export async function updateExpertRole(
  userId: string,
  roleId: string,
  data: Partial<ExpertRole>
): Promise<void> {
  const roleRef = doc(getDb(), 'users', userId, 'expertRoles', roleId);
  await updateDoc(roleRef, data);
}

export async function deleteExpertRole(userId: string, roleId: string): Promise<void> {
  const roleRef = doc(getDb(), 'users', userId, 'expertRoles', roleId);
  await deleteDoc(roleRef);
}

// Real-time subscription for expert roles
export function subscribeToExpertRoles(
  userId: string,
  callback: (roles: ExpertRole[]) => void
): Unsubscribe {
  const rolesRef = getUserCollection(userId, 'expertRoles');
  const q = query(rolesRef, orderBy('name', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const roles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ExpertRole));
    callback(roles);
  });
}

// ========================
// BATCH OPERATIONS (for seeding)
// ========================

export async function seedData(
  userId: string,
  categories: Omit<Category, 'id' | 'createdAt'>[],
  tags: Omit<Tag, 'id' | 'createdAt'>[],
  expertRoles: Omit<ExpertRole, 'id' | 'createdAt'>[],
  prompts: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  const batch = writeBatch(getDb());
  const timestamp = serverTimestamp();

  // Add categories
  const categoryIds: Record<string, string> = {};
  for (const category of categories) {
    const categoryRef = doc(getUserCollection(userId, 'categories'));
    categoryIds[category.name] = categoryRef.id;
    batch.set(categoryRef, { ...category, createdAt: timestamp });
  }

  // Add tags
  const tagIds: Record<string, string> = {};
  for (const tag of tags) {
    const tagRef = doc(getUserCollection(userId, 'tags'));
    tagIds[tag.name] = tagRef.id;
    batch.set(tagRef, { ...tag, createdAt: timestamp });
  }

  // Add expert roles
  const roleIds: Record<string, string> = {};
  for (const role of expertRoles) {
    const roleRef = doc(getUserCollection(userId, 'expertRoles'));
    roleIds[role.name] = roleRef.id;
    batch.set(roleRef, { ...role, createdAt: timestamp });
  }

  // Add prompts
  for (const prompt of prompts) {
    const promptRef = doc(getUserCollection(userId, 'prompts'));
    batch.set(promptRef, { ...prompt, createdAt: timestamp, updatedAt: timestamp });
  }

  await batch.commit();
}

// ========================
// EXPORT/IMPORT
// ========================

export async function exportAllData(userId: string) {
  const [prompts, categories, tags, expertRoles] = await Promise.all([
    getPrompts(userId),
    getCategories(userId),
    getTags(userId),
    getExpertRoles(userId),
  ]);

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    prompts,
    categories,
    tags,
    expertRoles,
  };
}

// ========================
// IMPORT OPERATIONS
// ========================

export async function importPrompts(
  userId: string,
  prompts: Partial<Prompt>[]
): Promise<void> {
  const batch = writeBatch(getDb());
  const timestamp = serverTimestamp();

  for (const prompt of prompts) {
    const promptRef = doc(getUserCollection(userId, 'prompts'));
    batch.set(promptRef, {
      title: prompt.title || 'Untitled',
      content: prompt.content || '',
      description: prompt.description || '',
      categoryId: prompt.categoryId || '',
      subcategoryId: prompt.subcategoryId || '',
      expertRoleId: prompt.expertRoleId || '',
      tags: prompt.tags || [],
      isFavorite: prompt.isFavorite || false,
      usageCount: prompt.usageCount || 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  await batch.commit();
}

export async function importCategories(
  userId: string,
  categories: Partial<Category>[]
): Promise<void> {
  const batch = writeBatch(getDb());
  const timestamp = serverTimestamp();

  for (const category of categories) {
    const categoryRef = doc(getUserCollection(userId, 'categories'));
    batch.set(categoryRef, {
      name: category.name || 'Untitled',
      color: category.color || '#6366f1',
      icon: category.icon || '',
      parentId: category.parentId || '',
      order: category.order || 0,
      promptCount: 0,
      createdAt: timestamp,
    });
  }

  await batch.commit();
}

export async function importTags(
  userId: string,
  tags: Partial<Tag>[]
): Promise<void> {
  const batch = writeBatch(getDb());
  const timestamp = serverTimestamp();

  for (const tag of tags) {
    const tagRef = doc(getUserCollection(userId, 'tags'));
    batch.set(tagRef, {
      name: tag.name || 'Untitled',
      color: tag.color || '#6366f1',
      usageCount: 0,
      createdAt: timestamp,
    });
  }

  await batch.commit();
}

export async function importExpertRoles(
  userId: string,
  roles: Partial<ExpertRole>[]
): Promise<void> {
  const batch = writeBatch(getDb());
  const timestamp = serverTimestamp();

  for (const role of roles) {
    const roleRef = doc(getUserCollection(userId, 'expertRoles'));
    batch.set(roleRef, {
      name: role.name || 'Untitled',
      description: role.description || '',
      experience: role.experience || '',
      systemPrompt: role.systemPrompt || '',
      createdAt: timestamp,
    });
  }

  await batch.commit();
}

// ========================
// SEED SAMPLE DATA
// ========================

export async function seedSampleData(userId: string): Promise<void> {
  const batch = writeBatch(getDb());
  const timestamp = serverTimestamp();

  // Create category IDs mapping
  const categoryRefs: Record<string, string> = {};
  const tagRefs: Record<string, string> = {};
  const roleRefs: Record<string, string> = {};

  // Sample Categories
  const sampleCategories = [
    { name: 'iOS Development', color: '#f97316', icon: 'smartphone', order: 0 },
    { name: 'Web Development', color: '#3b82f6', icon: 'globe', order: 1 },
    { name: 'UI/UX Design', color: '#a855f7', icon: 'palette', order: 2 },
    { name: 'Backend', color: '#22c55e', icon: 'server', order: 3 },
    { name: 'Code Review', color: '#ef4444', icon: 'search', order: 4 },
  ];

  for (const category of sampleCategories) {
    const categoryRef = doc(getUserCollection(userId, 'categories'));
    categoryRefs[category.name] = categoryRef.id;
    batch.set(categoryRef, { ...category, parentId: '', promptCount: 0, createdAt: timestamp });
  }

  // Subcategories
  const sampleSubcategories = [
    { name: 'Swift', color: '#f97316', parentId: 'iOS Development', order: 0 },
    { name: 'SwiftUI', color: '#f97316', parentId: 'iOS Development', order: 1 },
    { name: 'UIKit', color: '#f97316', parentId: 'iOS Development', order: 2 },
    { name: 'React', color: '#3b82f6', parentId: 'Web Development', order: 0 },
    { name: 'Vue.js', color: '#3b82f6', parentId: 'Web Development', order: 1 },
    { name: 'Node.js', color: '#3b82f6', parentId: 'Web Development', order: 2 },
    { name: 'Wireframe', color: '#a855f7', parentId: 'UI/UX Design', order: 0 },
    { name: 'Mockup', color: '#a855f7', parentId: 'UI/UX Design', order: 1 },
    { name: 'API Design', color: '#22c55e', parentId: 'Backend', order: 0 },
    { name: 'Database', color: '#22c55e', parentId: 'Backend', order: 1 },
  ];

  for (const sub of sampleSubcategories) {
    const subRef = doc(getUserCollection(userId, 'categories'));
    categoryRefs[sub.name] = subRef.id;
    batch.set(subRef, {
      name: sub.name,
      color: sub.color,
      icon: '',
      parentId: categoryRefs[sub.parentId] || '',
      order: sub.order,
      promptCount: 0,
      createdAt: timestamp,
    });
  }

  // Sample Tags
  const sampleTags = [
    { name: 'productivity', color: '#22c55e' },
    { name: 'debugging', color: '#ef4444' },
    { name: 'architecture', color: '#3b82f6' },
    { name: 'performance', color: '#f59e0b' },
    { name: 'security', color: '#dc2626' },
    { name: 'testing', color: '#8b5cf6' },
    { name: 'documentation', color: '#6366f1' },
    { name: 'refactoring', color: '#ec4899' },
    { name: 'best-practices', color: '#14b8a6' },
    { name: 'quick-fix', color: '#f97316' },
  ];

  for (const tag of sampleTags) {
    const tagRef = doc(getUserCollection(userId, 'tags'));
    tagRefs[tag.name] = tagRef.id;
    batch.set(tagRef, { ...tag, usageCount: 0, createdAt: timestamp });
  }

  // Sample Expert Roles
  const sampleRoles = [
    {
      name: 'iOS Tech Lead',
      description: 'Senior iOS developer with 12 years of experience',
      experience: '12 years',
      systemPrompt: 'You are an expert iOS developer with 12 years of experience...',
    },
    {
      name: 'Senior Frontend Developer',
      description: 'React and Vue.js specialist',
      experience: '8 years',
      systemPrompt: 'You are a senior frontend developer specializing in React and Vue.js...',
    },
    {
      name: 'UI/UX Designer',
      description: 'Product designer with focus on mobile apps',
      experience: '10 years',
      systemPrompt: 'You are an experienced UI/UX designer with 10 years of experience...',
    },
    {
      name: 'Backend Architect',
      description: 'System design and scalability expert',
      experience: '15 years',
      systemPrompt: 'You are a backend architect with expertise in system design...',
    },
    {
      name: 'Code Reviewer',
      description: 'Security and performance focused reviewer',
      experience: '10 years',
      systemPrompt: 'You are a meticulous code reviewer focused on security and performance...',
    },
  ];

  for (const role of sampleRoles) {
    const roleRef = doc(getUserCollection(userId, 'expertRoles'));
    roleRefs[role.name] = roleRef.id;
    batch.set(roleRef, { ...role, createdAt: timestamp });
  }

  // Sample Prompts
  const samplePrompts = [
    {
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

Please provide clean, production-ready code with comments explaining key decisions.`,
      description: 'Generate SwiftUI components following best practices',
      categoryId: categoryRefs['iOS Development'],
      subcategoryId: categoryRefs['SwiftUI'],
      expertRoleId: roleRefs['iOS Tech Lead'],
      tags: [tagRefs['productivity'], tagRefs['best-practices']],
      isFavorite: true,
      usageCount: 15,
    },
    {
      title: 'React Hook Generator',
      content: `Create a custom React hook called {{hook_name}} that:

Purpose: {{purpose}}

Requirements:
1. Follow React hooks best practices
2. Include proper TypeScript types
3. Handle loading, error, and success states
4. Include cleanup in useEffect if needed
5. Be reusable across components

Parameters:
{{parameters}}

Return values:
{{return_values}}

Please include:
- The hook implementation
- TypeScript interfaces
- Usage example
- Unit test example`,
      description: 'Generate custom React hooks with TypeScript',
      categoryId: categoryRefs['Web Development'],
      subcategoryId: categoryRefs['React'],
      expertRoleId: roleRefs['Senior Frontend Developer'],
      tags: [tagRefs['productivity'], tagRefs['testing']],
      isFavorite: true,
      usageCount: 23,
    },
    {
      title: 'API Endpoint Designer',
      content: `Design a RESTful API endpoint for {{resource_name}}:

Requirements:
- HTTP Method: {{method}}
- Authentication: {{auth_type}}
- Rate limiting: {{rate_limit}}

Request:
- Path parameters: {{path_params}}
- Query parameters: {{query_params}}
- Request body schema: {{request_body}}

Response:
- Success response format
- Error response format
- HTTP status codes

Please provide:
1. OpenAPI/Swagger specification
2. Example request/response
3. Validation rules
4. Security considerations`,
      description: 'Design RESTful API endpoints with OpenAPI spec',
      categoryId: categoryRefs['Backend'],
      subcategoryId: categoryRefs['API Design'],
      expertRoleId: roleRefs['Backend Architect'],
      tags: [tagRefs['architecture'], tagRefs['documentation']],
      isFavorite: false,
      usageCount: 8,
    },
    {
      title: 'Code Review Checklist',
      content: `Review the following {{language}} code for:

\`\`\`{{language}}
{{code}}
\`\`\`

Please analyze for:

1. **Security Issues**
   - Input validation
   - SQL injection
   - XSS vulnerabilities
   - Authentication/authorization flaws

2. **Performance**
   - Time complexity
   - Memory usage
   - Database queries optimization
   - Caching opportunities

3. **Code Quality**
   - SOLID principles adherence
   - DRY violations
   - Code readability
   - Error handling

4. **Testing**
   - Test coverage gaps
   - Edge cases not covered
   - Mock/stub recommendations

Provide specific line numbers and concrete suggestions for improvements.`,
      description: 'Comprehensive code review template',
      categoryId: categoryRefs['Code Review'],
      subcategoryId: '',
      expertRoleId: roleRefs['Code Reviewer'],
      tags: [tagRefs['security'], tagRefs['performance'], tagRefs['best-practices']],
      isFavorite: true,
      usageCount: 31,
    },
    {
      title: 'Debug Helper',
      content: `I'm encountering the following error in my {{language}} application:

Error message:
\`\`\`
{{error_message}}
\`\`\`

Stack trace:
\`\`\`
{{stack_trace}}
\`\`\`

Context:
- What I was trying to do: {{context}}
- Environment: {{environment}}
- Recent changes: {{recent_changes}}

Please help me:
1. Understand what's causing this error
2. Identify potential root causes
3. Provide step-by-step debugging approach
4. Suggest fixes with code examples
5. Recommend preventive measures`,
      description: 'Structured debugging assistance prompt',
      categoryId: categoryRefs['Code Review'],
      subcategoryId: '',
      expertRoleId: '',
      tags: [tagRefs['debugging'], tagRefs['quick-fix']],
      isFavorite: false,
      usageCount: 45,
    },
    {
      title: 'Database Schema Designer',
      content: `Design a database schema for {{application_type}} application:

Entities:
{{entities}}

Requirements:
- Database: {{database_type}}
- Expected scale: {{scale}}
- Read/write ratio: {{ratio}}

Please provide:
1. Entity-Relationship Diagram description
2. Table definitions with:
   - Column names and types
   - Primary keys
   - Foreign keys
   - Indexes
3. Sample queries for common operations
4. Migration scripts
5. Performance optimization tips`,
      description: 'Database schema design template',
      categoryId: categoryRefs['Backend'],
      subcategoryId: categoryRefs['Database'],
      expertRoleId: roleRefs['Backend Architect'],
      tags: [tagRefs['architecture'], tagRefs['performance']],
      isFavorite: false,
      usageCount: 12,
    },
    {
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
5. Null/undefined inputs

Include:
- Test file setup
- Mocks/stubs where needed
- Assertions with meaningful messages
- Test naming following {{convention}} convention`,
      description: 'Generate comprehensive unit tests',
      categoryId: categoryRefs['Code Review'],
      subcategoryId: '',
      expertRoleId: '',
      tags: [tagRefs['testing'], tagRefs['best-practices']],
      isFavorite: true,
      usageCount: 28,
    },
    {
      title: 'Refactoring Guide',
      content: `Refactor the following {{language}} code to improve {{improvement_focus}}:

Current code:
\`\`\`{{language}}
{{code}}
\`\`\`

Goals:
- {{goal_1}}
- {{goal_2}}
- {{goal_3}}

Constraints:
- Must maintain backward compatibility
- Cannot change public API
- Performance should not degrade

Please provide:
1. Analysis of current issues
2. Refactored code with explanations
3. Before/after comparison
4. Migration guide if needed
5. Tests to verify behavior preservation`,
      description: 'Structured code refactoring template',
      categoryId: categoryRefs['Code Review'],
      subcategoryId: '',
      expertRoleId: roleRefs['Code Reviewer'],
      tags: [tagRefs['refactoring'], tagRefs['best-practices']],
      isFavorite: false,
      usageCount: 19,
    },
    {
      title: 'UI Component Specification',
      content: `Create a detailed specification for a {{component_type}} component:

User Story:
As a {{user_role}}, I want to {{action}} so that {{benefit}}.

Visual Requirements:
- Layout: {{layout}}
- Colors: {{colors}}
- Typography: {{typography}}
- Spacing: {{spacing}}

States:
1. Default
2. Hover
3. Active/Pressed
4. Disabled
5. Loading
6. Error

Interactions:
- {{interaction_1}}
- {{interaction_2}}

Accessibility:
- ARIA labels
- Keyboard navigation
- Screen reader support

Please provide:
1. Detailed wireframe description
2. Component props/API
3. CSS/styling approach
4. Animation specifications`,
      description: 'UI component design specification template',
      categoryId: categoryRefs['UI/UX Design'],
      subcategoryId: categoryRefs['Mockup'],
      expertRoleId: roleRefs['UI/UX Designer'],
      tags: [tagRefs['documentation'], tagRefs['best-practices']],
      isFavorite: false,
      usageCount: 7,
    },
    {
      title: 'Performance Optimization Analysis',
      content: `Analyze and optimize the performance of:

Code/System: {{target}}

Current metrics:
- Response time: {{response_time}}
- Memory usage: {{memory}}
- CPU usage: {{cpu}}

Environment:
- Platform: {{platform}}
- Scale: {{scale}}
- Constraints: {{constraints}}

Please analyze:
1. **Bottlenecks**
   - Identify performance bottlenecks
   - Measure impact of each

2. **Optimizations**
   - Quick wins (low effort, high impact)
   - Medium-term improvements
   - Long-term architectural changes

3. **Recommendations**
   - Specific code changes
   - Caching strategies
   - Resource optimization
   - Monitoring setup

4. **Expected Results**
   - Projected improvements
   - Tradeoffs to consider`,
      description: 'Performance analysis and optimization template',
      categoryId: categoryRefs['Backend'],
      subcategoryId: '',
      expertRoleId: roleRefs['Backend Architect'],
      tags: [tagRefs['performance'], tagRefs['architecture']],
      isFavorite: true,
      usageCount: 14,
    },
  ];

  for (const prompt of samplePrompts) {
    const promptRef = doc(getUserCollection(userId, 'prompts'));
    batch.set(promptRef, {
      ...prompt,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  await batch.commit();
}
