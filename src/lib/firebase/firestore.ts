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
  PromptVersion,
  Category,
  Tag,
  ExpertRole,
  PromptFilters,
  SortOptions,
  BulkAction,
  BulkOperationResult,
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
    version: 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(promptsRef, promptData);
  return docRef.id;
}

export async function updatePrompt(
  userId: string,
  promptId: string,
  data: Partial<PromptFormData>,
  saveVersion: boolean = true
): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);

  // Get current prompt data to save as version
  if (saveVersion) {
    const snapshot = await getDoc(promptRef);
    if (snapshot.exists()) {
      const currentPrompt = snapshot.data();
      const currentVersion = currentPrompt.version || 1;

      // Save current state as a version
      const versionsRef = collection(getDb(), 'users', userId, 'prompts', promptId, 'versions');
      await addDoc(versionsRef, {
        promptId,
        version: currentVersion,
        title: currentPrompt.title,
        content: currentPrompt.content,
        description: currentPrompt.description || '',
        categoryId: currentPrompt.categoryId || '',
        subcategoryId: currentPrompt.subcategoryId || '',
        expertRoleId: currentPrompt.expertRoleId || '',
        tags: currentPrompt.tags || [],
        compatibleModels: currentPrompt.compatibleModels || [],
        createdAt: serverTimestamp(),
      });

      // Update prompt with incremented version
      await updateDoc(promptRef, {
        ...data,
        version: currentVersion + 1,
        updatedAt: serverTimestamp(),
      });
      return;
    }
  }

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

// ========================
// SPRINT 1: NEW FEATURES
// ========================

// Duplicate/Clone Prompt
export async function duplicatePrompt(userId: string, promptId: string): Promise<string> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  const snapshot = await getDoc(promptRef);

  if (!snapshot.exists()) {
    throw new Error('Prompt not found');
  }

  const originalPrompt = snapshot.data();
  const promptsRef = getUserCollection(userId, 'prompts');

  const duplicatedPrompt = {
    title: `${originalPrompt.title} (Copy)`,
    content: originalPrompt.content,
    description: originalPrompt.description || '',
    categoryId: originalPrompt.categoryId || '',
    subcategoryId: originalPrompt.subcategoryId || '',
    expertRoleId: originalPrompt.expertRoleId || '',
    tags: originalPrompt.tags || [],
    compatibleModels: originalPrompt.compatibleModels || [],
    isFavorite: false,
    isPinned: false,
    isDeleted: false,
    usageCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(promptsRef, duplicatedPrompt);
  return docRef.id;
}

// Toggle Pin
export async function togglePin(userId: string, promptId: string, isPinned: boolean): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  await updateDoc(promptRef, {
    isPinned,
    pinnedAt: isPinned ? serverTimestamp() : null,
    updatedAt: serverTimestamp()
  });
}

// Soft Delete (move to trash)
export async function softDeletePrompt(userId: string, promptId: string): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  await updateDoc(promptRef, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// Restore from trash
export async function restorePrompt(userId: string, promptId: string): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  await updateDoc(promptRef, {
    isDeleted: false,
    deletedAt: null,
    updatedAt: serverTimestamp()
  });
}

// Permanently delete
export async function permanentlyDeletePrompt(userId: string, promptId: string): Promise<void> {
  const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);
  await deleteDoc(promptRef);
}

// Empty trash (delete all deleted prompts)
export async function emptyTrash(userId: string): Promise<number> {
  const promptsRef = getUserCollection(userId, 'prompts');
  const q = query(promptsRef, where('isDeleted', '==', true));
  const snapshot = await getDocs(q);

  const batch = writeBatch(getDb());
  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });

  await batch.commit();
  return snapshot.docs.length;
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
// SPRINT 2: VERSION HISTORY
// ========================

// Get all versions for a prompt
export async function getPromptVersions(userId: string, promptId: string): Promise<PromptVersion[]> {
  const versionsRef = collection(getDb(), 'users', userId, 'prompts', promptId, 'versions');
  const q = query(versionsRef, orderBy('version', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PromptVersion));
}

// Get a specific version
export async function getPromptVersion(
  userId: string,
  promptId: string,
  versionId: string
): Promise<PromptVersion | null> {
  const versionRef = doc(getDb(), 'users', userId, 'prompts', promptId, 'versions', versionId);
  const snapshot = await getDoc(versionRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as PromptVersion;
  }
  return null;
}

// Restore a specific version
export async function restorePromptVersion(
  userId: string,
  promptId: string,
  versionId: string
): Promise<void> {
  // Get the version to restore
  const version = await getPromptVersion(userId, promptId, versionId);
  if (!version) {
    throw new Error('Version not found');
  }

  // Update the prompt with the version data (this will save current as a new version)
  await updatePrompt(userId, promptId, {
    title: version.title,
    content: version.content,
    description: version.description,
    categoryId: version.categoryId,
    subcategoryId: version.subcategoryId,
    expertRoleId: version.expertRoleId,
    tags: version.tags,
    compatibleModels: version.compatibleModels,
  });
}

// Subscribe to versions for real-time updates
export function subscribeToPromptVersions(
  userId: string,
  promptId: string,
  callback: (versions: PromptVersion[]) => void
): Unsubscribe {
  const versionsRef = collection(getDb(), 'users', userId, 'prompts', promptId, 'versions');
  const q = query(versionsRef, orderBy('version', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const versions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PromptVersion));
    callback(versions);
  });
}

// ========================
// SPRINT 2: BULK OPERATIONS
// ========================

export async function bulkOperation(
  userId: string,
  promptIds: string[],
  action: BulkAction,
  payload?: { tagId?: string; categoryId?: string }
): Promise<BulkOperationResult> {
  const batch = writeBatch(getDb());
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const promptId of promptIds) {
    try {
      const promptRef = doc(getDb(), 'users', userId, 'prompts', promptId);

      switch (action) {
        case 'delete':
          batch.update(promptRef, {
            isDeleted: true,
            deletedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          break;
        case 'restore':
          batch.update(promptRef, {
            isDeleted: false,
            deletedAt: null,
            updatedAt: serverTimestamp(),
          });
          break;
        case 'favorite':
          batch.update(promptRef, {
            isFavorite: true,
            updatedAt: serverTimestamp(),
          });
          break;
        case 'unfavorite':
          batch.update(promptRef, {
            isFavorite: false,
            updatedAt: serverTimestamp(),
          });
          break;
        case 'pin':
          batch.update(promptRef, {
            isPinned: true,
            pinnedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          break;
        case 'unpin':
          batch.update(promptRef, {
            isPinned: false,
            pinnedAt: null,
            updatedAt: serverTimestamp(),
          });
          break;
        case 'addTag':
          if (payload?.tagId) {
            const snapshot = await getDoc(promptRef);
            if (snapshot.exists()) {
              const currentTags = snapshot.data().tags || [];
              if (!currentTags.includes(payload.tagId)) {
                batch.update(promptRef, {
                  tags: [...currentTags, payload.tagId],
                  updatedAt: serverTimestamp(),
                });
              }
            }
          }
          break;
        case 'removeTag':
          if (payload?.tagId) {
            const snapshot = await getDoc(promptRef);
            if (snapshot.exists()) {
              const currentTags = snapshot.data().tags || [];
              batch.update(promptRef, {
                tags: currentTags.filter((t: string) => t !== payload.tagId),
                updatedAt: serverTimestamp(),
              });
            }
          }
          break;
        case 'moveToCategory':
          if (payload?.categoryId !== undefined) {
            batch.update(promptRef, {
              categoryId: payload.categoryId || '',
              subcategoryId: '',
              updatedAt: serverTimestamp(),
            });
          }
          break;
        case 'permanentDelete':
          batch.delete(promptRef);
          break;
      }
      success++;
    } catch (error) {
      failed++;
      errors.push(`Failed to process prompt ${promptId}`);
    }
  }

  await batch.commit();
  return { success, failed, errors: errors.length > 0 ? errors : undefined };
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

