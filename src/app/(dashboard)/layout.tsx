'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CreatePromptDialog } from '@/components/prompts/create-prompt-dialog';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { PromptSubscriptionManager } from '@/components/providers/prompt-provider';
import { SkipLink } from '@/components/accessibility/skip-link';
import { useAuth } from '@/hooks/use-auth';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({ enabled: isAuthenticated });

  // Redirect to login if not authenticated (after loading is complete)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, don't render dashboard
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <SkipLink href="#main-content" />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main
            id="main-content"
            className="flex-1 overflow-auto p-4 lg:p-6 pb-20 md:pb-6"
            role="main"
            aria-label="Main content"
          >
            <Breadcrumb className="mb-4 hidden sm:flex" />
            {children}
          </main>
        </SidebarInset>
        <MobileNav />
        <PromptSubscriptionManager />
        <CreatePromptDialog />
        <KeyboardShortcutsDialog />
      </SidebarProvider>
    </>
  );
}
