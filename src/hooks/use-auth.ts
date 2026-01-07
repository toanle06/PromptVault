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
    setUser,
    setUserData,
    setLoading,
    logout: clearAuth,
  } = useAuthStore();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const data = await getUserData(firebaseUser.uid);
          setUserData(data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Don't block auth, just leave userData as null for now
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setUserData, setLoading]);

  // Sign in with email
  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        await signInWithEmail(email, password);
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
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [setLoading]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut();
      clearAuth();
      router.push('/login');
    } catch (error) {
      throw error;
    }
  }, [router, clearAuth]);

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
