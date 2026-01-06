'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usePromptStore } from '@/store/prompt-store';
import {
  subscribeToExpertRoles,
  createExpertRole as createExpertRoleFn,
  updateExpertRole as updateExpertRoleFn,
  deleteExpertRole as deleteExpertRoleFn,
  importExpertRoles as importExpertRolesFn,
} from '@/lib/firebase/firestore';
import {
  getDemoExpertRoles,
  createDemoExpertRole,
  updateDemoExpertRole,
  deleteDemoExpertRole,
  initializeDemoData,
} from '@/lib/demo/demo-store';
import type { ExpertRole } from '@/types';
import { toast } from 'sonner';

export function useExpertRoles() {
  const { user, isDemoMode } = useAuthStore();
  const { expertRoles, setExpertRoles, getExpertRoleById } = usePromptStore();

  // Subscribe to expert roles (or load demo data)
  useEffect(() => {
    if (!user?.uid) {
      setExpertRoles([]);
      return;
    }

    // Demo mode - load from localStorage
    if (isDemoMode) {
      initializeDemoData();
      setExpertRoles(getDemoExpertRoles());
      return;
    }

    // Firebase mode
    const unsubscribe = subscribeToExpertRoles(user.uid, (newRoles) => {
      setExpertRoles(newRoles);
    });

    return () => unsubscribe();
  }, [user?.uid, isDemoMode, setExpertRoles]);

  // Create expert role
  const createExpertRole = useCallback(
    async (data: Omit<ExpertRole, 'id' | 'createdAt'>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        let id: string;
        if (isDemoMode) {
          id = createDemoExpertRole(data);
          setExpertRoles(getDemoExpertRoles());
        } else {
          id = await createExpertRoleFn(user.uid, data);
        }
        toast.success('Expert role created successfully');
        return id;
      } catch (error) {
        toast.error('Failed to create expert role');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setExpertRoles]
  );

  // Update expert role
  const updateExpertRole = useCallback(
    async (roleId: string, data: Partial<ExpertRole>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          updateDemoExpertRole(roleId, data);
          setExpertRoles(getDemoExpertRoles());
        } else {
          await updateExpertRoleFn(user.uid, roleId, data);
        }
        toast.success('Expert role updated successfully');
      } catch (error) {
        toast.error('Failed to update expert role');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setExpertRoles]
  );

  // Delete expert role
  const deleteExpertRole = useCallback(
    async (roleId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          deleteDemoExpertRole(roleId);
          setExpertRoles(getDemoExpertRoles());
        } else {
          await deleteExpertRoleFn(user.uid, roleId);
        }
        toast.success('Expert role deleted successfully');
      } catch (error) {
        toast.error('Failed to delete expert role');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setExpertRoles]
  );

  // Import expert roles
  const importExpertRoles = useCallback(
    async (rolesData: Partial<ExpertRole>[]) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        if (isDemoMode) {
          rolesData.forEach(role => {
            createDemoExpertRole({
              name: role.name || 'Untitled',
              description: role.description || '',
              experience: role.experience || '',
              systemPrompt: role.systemPrompt || '',
            });
          });
          setExpertRoles(getDemoExpertRoles());
        } else {
          await importExpertRolesFn(user.uid, rolesData);
        }
      } catch (error) {
        toast.error('Failed to import expert roles');
        throw error;
      }
    },
    [user?.uid, isDemoMode, setExpertRoles]
  );

  return {
    expertRoles,
    getExpertRoleById,
    createExpertRole,
    updateExpertRole,
    deleteExpertRole,
    importExpertRoles,
  };
}
