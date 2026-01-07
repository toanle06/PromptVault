'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface Announcement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
}

interface AnnouncerContextValue {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

/**
 * Hook to announce messages to screen readers
 *
 * @example
 * const { announce } = useAnnouncer();
 * announce('Item deleted successfully');
 * announce('Error occurred', 'assertive');
 */
export function useAnnouncer() {
  const context = useContext(AnnouncerContext);

  if (!context) {
    // Return a no-op if not within provider
    return {
      announce: () => {
        console.warn('useAnnouncer must be used within ScreenReaderAnnouncerProvider');
      },
    };
  }

  return context;
}

interface ScreenReaderAnnouncerProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for screen reader announcements
 *
 * Wrap your app with this provider to enable announcements.
 *
 * @example
 * <ScreenReaderAnnouncerProvider>
 *   <App />
 * </ScreenReaderAnnouncerProvider>
 */
export function ScreenReaderAnnouncerProvider({ children }: ScreenReaderAnnouncerProviderProps) {
  const [politeAnnouncement, setPoliteAnnouncement] = useState('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the announcement
    if (priority === 'assertive') {
      setAssertiveAnnouncement(message);
      // Clear after a short delay
      timeoutRef.current = setTimeout(() => setAssertiveAnnouncement(''), 100);
    } else {
      setPoliteAnnouncement(message);
      // Clear after a short delay
      timeoutRef.current = setTimeout(() => setPoliteAnnouncement(''), 100);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}

      {/* Polite live region - for non-urgent updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeAnnouncement}
      </div>

      {/* Assertive live region - for urgent updates */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveAnnouncement}
      </div>
    </AnnouncerContext.Provider>
  );
}

/**
 * Component to announce a message on mount
 * Useful for route changes or async content loading
 *
 * @example
 * <RouteAnnouncement message="Dashboard page loaded" />
 */
interface RouteAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export function RouteAnnouncement({ message, priority = 'polite' }: RouteAnnouncementProps) {
  const { announce } = useAnnouncer();

  useEffect(() => {
    announce(message, priority);
  }, [message, priority, announce]);

  return null;
}
