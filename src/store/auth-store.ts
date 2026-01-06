import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/types';

// Demo user for testing without Firebase
const DEMO_USER_ID = 'demo-user-123';

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

const demoUser: DemoUser = {
  uid: DEMO_USER_ID,
  email: 'demo@promptvault.app',
  displayName: 'Demo User',
  photoURL: null,
};

interface AuthState {
  user: FirebaseUser | DemoUser | null;
  userData: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setUserData: (userData: User | null) => void;
  setLoading: (loading: boolean) => void;
  loginAsDemo: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userData: null,
      isLoading: true,
      isAuthenticated: false,
      isDemoMode: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          isDemoMode: false,
        }),
      setUserData: (userData) => set({ userData }),
      setLoading: (isLoading) => set({ isLoading }),
      loginAsDemo: () =>
        set({
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          isDemoMode: true,
          userData: {
            uid: DEMO_USER_ID,
            email: 'demo@promptvault.app',
            displayName: 'Demo User',
            preferences: {
              theme: 'system',
              defaultView: 'grid',
              promptsPerPage: 20,
            },
          } as User,
        }),
      logout: () =>
        set({
          user: null,
          userData: null,
          isAuthenticated: false,
          isDemoMode: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isDemoMode: state.isDemoMode,
        user: state.isDemoMode ? state.user : null,
        userData: state.isDemoMode ? state.userData : null,
        isAuthenticated: state.isDemoMode ? state.isAuthenticated : false,
      }),
    }
  )
);
