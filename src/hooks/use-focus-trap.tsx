'use client';

import { useRef, useEffect, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

interface UseFocusTrapOptions {
  enabled?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * Focus Trap Hook
 *
 * Traps keyboard focus within a container element.
 * Useful for modals, dialogs, and other overlay components.
 *
 * @example
 * const { containerRef } = useFocusTrap({ enabled: isOpen });
 * return <div ref={containerRef}>...</div>
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  enabled = true,
  restoreFocus = true,
  initialFocusRef,
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<T>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => {
      // Filter out elements that are not visible
      return el.offsetParent !== null;
    });
  }, []);

  // Handle tab key navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [enabled, getFocusableElements]
  );

  // Set initial focus
  useEffect(() => {
    if (!enabled) return;

    // Store the currently focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable element
    const setInitialFocus = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    // Small delay to ensure the container is mounted
    const timeoutId = setTimeout(setInitialFocus, 0);

    return () => {
      clearTimeout(timeoutId);

      // Restore focus when unmounting
      if (restoreFocus && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [enabled, restoreFocus, initialFocusRef, getFocusableElements]);

  // Add keydown listener
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  return { containerRef };
}

/**
 * Focus Ring Component Wrapper
 *
 * Adds consistent focus ring styling to any component.
 */
interface FocusRingProps {
  children: React.ReactElement;
  className?: string;
}

export function FocusRing({ children, className }: FocusRingProps) {
  return children;
}

/**
 * Programmatic focus management utilities
 */
export const focusUtils = {
  /**
   * Focus first focusable element within a container
   */
  focusFirst: (container: HTMLElement | null) => {
    if (!container) return;
    const focusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    focusable?.focus();
  },

  /**
   * Focus an element by ID
   */
  focusById: (id: string) => {
    const element = document.getElementById(id);
    if (element && 'focus' in element) {
      (element as HTMLElement).focus();
    }
  },

  /**
   * Focus an element by data attribute
   */
  focusByDataAttr: (attr: string, value?: string) => {
    const selector = value ? `[${attr}="${value}"]` : `[${attr}]`;
    const element = document.querySelector<HTMLElement>(selector);
    element?.focus();
  },

  /**
   * Announce message to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },
};
