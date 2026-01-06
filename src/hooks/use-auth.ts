'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import {
  signInWithEmail,
  registerWithEmail,
  signInWithGoogle,
  signOut as firebaseSignOut,
  resetPassword,
  onAuthChange,
  getUserData,
} from '@/lib/firebase/auth';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    userData,
    isLoading,
    isAuthenticated,
    isDemoMode,
    setUser,
    setUserData,
    setLoading,
    logout: clearAuth,
  } = useAuthStore();

  // Listen for auth state changes (skip if in demo mode)
  useEffect(() => {
    // Don't listen to Firebase auth if in demo mode
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const data = await getUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [isDemoMode, setUser, setUserData, setLoading]);

  // Sign in with email
  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        await signInWithEmail(email, password);
        // Navigation handled by auth page useEffect when isAuthenticated changes
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading]
  );

  // Register with email
  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setLoading(true);
      try {
        await registerWithEmail(email, password, displayName);
        // Navigation handled by auth page useEffect when isAuthenticated changes
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setLoading]
  );

  // Sign in with Google
  const signInGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Navigation handled by auth page useEffect when isAuthenticated changes
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setLoading]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Only call Firebase signOut if not in demo mode
      if (!isDemoMode) {
        await firebaseSignOut();
      }
      clearAuth();
      router.push('/login');
    } catch (error) {
      throw error;
    }
  }, [router, clearAuth, isDemoMode]);

  // Send password reset email
  const sendPasswordReset = useCallback(async (email: string) => {
    await resetPassword(email);
  }, []);

  return {
    user,
    userData,
    isLoading,
    isAuthenticated,
    signIn,
    register,
    signInGoogle,
    signOut,
    sendPasswordReset,
  };
}
