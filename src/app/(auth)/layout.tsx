'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { onAuthChange } from '@/lib/firebase/auth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      if (user) {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router, setUser]);

  // If authenticated, don't render auth pages
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
