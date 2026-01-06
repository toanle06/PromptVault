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
import type { ExpertRole } from '@/types';
import { toast } from 'sonner';

export function useExpertRoles() {
  const { user } = useAuthStore();
  const { expertRoles, setExpertRoles, getExpertRoleById } = usePromptStore();

  // Subscribe to expert roles
  useEffect(() => {
    if (!user?.uid) {
      setExpertRoles([]);
      return;
    }

    const unsubscribe = subscribeToExpertRoles(user.uid, (newRoles) => {
      setExpertRoles(newRoles);
    });

    return () => unsubscribe();
  }, [user?.uid, setExpertRoles]);

  // Create expert role
  const createExpertRole = useCallback(
    async (data: Omit<ExpertRole, 'id' | 'createdAt'>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const id = await createExpertRoleFn(user.uid, data);
        toast.success('Expert role created successfully');
        return id;
      } catch (error) {
        toast.error('Failed to create expert role');
        throw error;
      }
    },
    [user?.uid]
  );

  // Update expert role
  const updateExpertRole = useCallback(
    async (roleId: string, data: Partial<ExpertRole>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await updateExpertRoleFn(user.uid, roleId, data);
        toast.success('Expert role updated successfully');
      } catch (error) {
        toast.error('Failed to update expert role');
        throw error;
      }
    },
    [user?.uid]
  );

  // Delete expert role
  const deleteExpertRole = useCallback(
    async (roleId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await deleteExpertRoleFn(user.uid, roleId);
        toast.success('Expert role deleted successfully');
      } catch (error) {
        toast.error('Failed to delete expert role');
        throw error;
      }
    },
    [user?.uid]
  );

  // Import expert roles
  const importExpertRoles = useCallback(
    async (rolesData: Partial<ExpertRole>[]) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await importExpertRolesFn(user.uid, rolesData);
      } catch (error) {
        toast.error('Failed to import expert roles');
        throw error;
      }
    },
    [user?.uid]
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
