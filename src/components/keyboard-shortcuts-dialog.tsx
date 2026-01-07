'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUIStore } from '@/store/ui-store';
import { KEYBOARD_SHORTCUTS, formatShortcut } from '@/hooks/use-keyboard-shortcuts';
import { Keyboard } from 'lucide-react';

export function KeyboardShortcutsDialog() {
  const { isShortcutsHelpOpen, setShortcutsHelpOpen } = useUIStore();

  // Group shortcuts by scope
  const globalShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.scope === 'global');
  const listShortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.scope === 'list');

  // Dedupe shortcuts that have both ctrl and meta variants
  const dedupeShortcuts = (shortcuts: typeof KEYBOARD_SHORTCUTS) => {
    const seen = new Set<string>();
    return shortcuts.filter((s) => {
      const key = `${s.action}-${s.key}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const uniqueGlobalShortcuts = dedupeShortcuts(globalShortcuts);
  const uniqueListShortcuts = dedupeShortcuts(listShortcuts);

  return (
    <Dialog open={isShortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Global Shortcuts */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Global
            </h3>
            <div className="space-y-2">
              {uniqueGlobalShortcuts.map((shortcut) => (
                <div
                  key={`${shortcut.action}-${shortcut.key}`}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded-md min-w-[60px] text-center">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* List View Shortcuts */}
          {uniqueListShortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                List View
              </h3>
              <div className="space-y-2">
                {uniqueListShortcuts.map((shortcut) => (
                  <div
                    key={`${shortcut.action}-${shortcut.key}`}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted border rounded-md min-w-[60px] text-center">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border rounded">?</kbd> anytime to show this dialog
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
