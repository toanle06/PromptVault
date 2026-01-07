'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { ScreenReaderAnnouncerProvider } from '@/components/accessibility/screen-reader-announcer';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ScreenReaderAnnouncerProvider>
        {children}
        <Toaster position="bottom-right" richColors />
      </ScreenReaderAnnouncerProvider>
    </ThemeProvider>
  );
}
