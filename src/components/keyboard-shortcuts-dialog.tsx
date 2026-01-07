'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUIStore } from '@/store/ui-store';
import { KEYBOARD_SHORTCUTS, formatShortcut } from '@/hooks/use-keyboard-shortcuts';
import { Keyboard, Navigation, LayoutGrid, Zap } from 'lucide-react';

interface ShortcutItemProps {
  description: string;
  shortcutKey: string;
}

function ShortcutItem({ description, shortcutKey }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <span className="text-sm">{description}</span>
      <kbd className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold bg-muted border rounded-md min-w-[48px] shadow-sm">
        {shortcutKey}
      </kbd>
    </div>
  );
}

interface ShortcutGroupProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function ShortcutGroup({ title, icon: Icon, children }: ShortcutGroupProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

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

  // Split global shortcuts into categories
  const navigationShortcuts = uniqueGlobalShortcuts.filter((s) =>
    ['goHome', 'goPrompts', 'goFavorites'].includes(s.action)
  );
  const actionShortcuts = uniqueGlobalShortcuts.filter((s) =>
    ['newPrompt', 'search', 'help', 'escape'].includes(s.action)
  );

  return (
    <Dialog open={isShortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Keyboard className="h-4 w-4 text-primary" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate quickly
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-4 space-y-6">
            {/* Quick Actions */}
            <ShortcutGroup title="Quick Actions" icon={Zap}>
              {actionShortcuts.map((shortcut) => (
                <ShortcutItem
                  key={`${shortcut.action}-${shortcut.key}`}
                  description={shortcut.description}
                  shortcutKey={formatShortcut(shortcut)}
                />
              ))}
            </ShortcutGroup>

            {/* Navigation */}
            {navigationShortcuts.length > 0 && (
              <ShortcutGroup title="Navigation" icon={Navigation}>
                {navigationShortcuts.map((shortcut) => (
                  <ShortcutItem
                    key={`${shortcut.action}-${shortcut.key}`}
                    description={shortcut.description}
                    shortcutKey={formatShortcut(shortcut)}
                  />
                ))}
              </ShortcutGroup>
            )}

            {/* View Shortcuts */}
            {uniqueListShortcuts.length > 0 && (
              <ShortcutGroup title="List View" icon={LayoutGrid}>
                {uniqueListShortcuts.map((shortcut) => (
                  <ShortcutItem
                    key={`${shortcut.action}-${shortcut.key}`}
                    description={shortcut.description}
                    shortcutKey={formatShortcut(shortcut)}
                  />
                ))}
              </ShortcutGroup>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Press{' '}
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold bg-background border rounded shadow-sm">
              ?
            </kbd>{' '}
            anytime to show this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
