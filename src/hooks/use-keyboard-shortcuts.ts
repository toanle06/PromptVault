'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';
import type { KeyboardShortcut } from '@/types';

// Define all available shortcuts
export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Global shortcuts
  { key: 'n', modifiers: ['ctrl'], action: 'newPrompt', description: 'Create new prompt', scope: 'global' },
  { key: 'n', modifiers: ['meta'], action: 'newPrompt', description: 'Create new prompt', scope: 'global' },
  { key: 'k', modifiers: ['ctrl'], action: 'search', description: 'Open search', scope: 'global' },
  { key: 'k', modifiers: ['meta'], action: 'search', description: 'Open search', scope: 'global' },
  { key: '/', action: 'search', description: 'Focus search', scope: 'global' },
  { key: '?', modifiers: ['shift'], action: 'help', description: 'Show keyboard shortcuts', scope: 'global' },
  { key: 'Escape', action: 'escape', description: 'Close dialog/modal', scope: 'global' },

  // Navigation shortcuts
  { key: 'g', action: 'goHome', description: 'Go to home', scope: 'global' },
  { key: 'h', modifiers: ['ctrl'], action: 'goHome', description: 'Go to home', scope: 'global' },
  { key: 'p', modifiers: ['ctrl'], action: 'goPrompts', description: 'Go to prompts', scope: 'global' },
  { key: 'p', modifiers: ['meta'], action: 'goPrompts', description: 'Go to prompts', scope: 'global' },
  { key: 'f', modifiers: ['ctrl'], action: 'goFavorites', description: 'Go to favorites', scope: 'global' },
  { key: 'f', modifiers: ['meta'], action: 'goFavorites', description: 'Go to favorites', scope: 'global' },

  // View shortcuts
  { key: '1', action: 'gridView', description: 'Switch to grid view', scope: 'list' },
  { key: '2', action: 'listView', description: 'Switch to list view', scope: 'list' },

  // List shortcuts
  { key: 'a', modifiers: ['ctrl'], action: 'selectAll', description: 'Select all', scope: 'list' },
  { key: 'a', modifiers: ['meta'], action: 'selectAll', description: 'Select all', scope: 'list' },
];

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  onAction?: (action: string) => void;
  scope?: KeyboardShortcut['scope'];
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, onAction, scope = 'global' } = options;
  const router = useRouter();
  const { setCreatePromptOpen, setSearchOpen, setShortcutsHelpOpen } = useUIStore();

  // Track if we're in an input field
  const isInputFocusedRef = useRef(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow escape key even in inputs
      if (isInput && event.key !== 'Escape') {
        return;
      }

      // Find matching shortcut
      const matchingShortcut = KEYBOARD_SHORTCUTS.find((shortcut) => {
        // Check key match
        if (shortcut.key.toLowerCase() !== event.key.toLowerCase()) {
          return false;
        }

        // Check scope
        if (shortcut.scope && shortcut.scope !== 'global' && shortcut.scope !== scope) {
          return false;
        }

        // Check modifiers
        const modifiers = shortcut.modifiers || [];
        const ctrlRequired = modifiers.includes('ctrl');
        const metaRequired = modifiers.includes('meta');
        const altRequired = modifiers.includes('alt');
        const shiftRequired = modifiers.includes('shift');

        // Allow either ctrl or meta for cross-platform compatibility
        const ctrlOrMetaRequired = ctrlRequired || metaRequired;
        const ctrlOrMetaPressed = event.ctrlKey || event.metaKey;

        if (ctrlOrMetaRequired && !ctrlOrMetaPressed) return false;
        if (!ctrlOrMetaRequired && ctrlOrMetaPressed && event.key !== 'Escape') return false;
        if (altRequired !== event.altKey) return false;
        if (shiftRequired !== event.shiftKey) return false;

        return true;
      });

      if (!matchingShortcut) return;

      // Prevent default browser behavior
      event.preventDefault();

      // Execute action
      const action = matchingShortcut.action;

      // Call custom handler if provided
      if (onAction) {
        onAction(action);
      }

      // Built-in actions
      switch (action) {
        case 'newPrompt':
          setCreatePromptOpen(true);
          break;
        case 'search':
          setSearchOpen(true);
          break;
        case 'help':
          setShortcutsHelpOpen(true);
          break;
        case 'escape':
          setCreatePromptOpen(false);
          setSearchOpen(false);
          setShortcutsHelpOpen(false);
          break;
        case 'goHome':
          router.push('/');
          break;
        case 'goPrompts':
          router.push('/prompts');
          break;
        case 'goFavorites':
          router.push('/prompts?favorites=true');
          break;
        case 'gridView':
          useUIStore.getState().setViewMode('grid');
          break;
        case 'listView':
          useUIStore.getState().setViewMode('list');
          break;
      }
    },
    [router, setCreatePromptOpen, setSearchOpen, setShortcutsHelpOpen, onAction, scope]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: KEYBOARD_SHORTCUTS,
  };
}

// Helper to format shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const modifiers = shortcut.modifiers || [];

  // Use ⌘ for Mac, Ctrl for others
  const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');

  if (modifiers.includes('ctrl') || modifiers.includes('meta')) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (modifiers.includes('alt')) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (modifiers.includes('shift')) {
    parts.push(isMac ? '⇧' : 'Shift');
  }

  // Format special keys
  let key = shortcut.key;
  if (key === 'Escape') key = 'Esc';
  if (key === ' ') key = 'Space';

  parts.push(key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
