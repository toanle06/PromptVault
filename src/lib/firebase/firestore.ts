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

