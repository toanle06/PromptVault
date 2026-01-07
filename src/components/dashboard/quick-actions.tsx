'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUIStore } from '@/store/ui-store';
import {
  Plus,
  FolderOpen,
  Tags,
  Search,
  Star,
  Keyboard,
  FileText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  action?: () => void;
  href?: string;
  shortcut?: string;
  variant?: 'default' | 'primary';
}

export function QuickActions() {
  const { setCreatePromptOpen, setShortcutsHelpOpen } = useUIStore();

  const actions: QuickAction[] = [
    {
      icon: Plus,
      label: 'New Prompt',
      description: 'Create a new AI prompt',
      action: () => setCreatePromptOpen(true),
      shortcut: 'N',
      variant: 'primary',
    },
    {
      icon: Search,
      label: 'Search',
      description: 'Find prompts quickly',
      shortcut: '/',
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      icon: FolderOpen,
      label: 'Categories',
      description: 'Organize prompts',
      href: '/categories',
    },
    {
      icon: Tags,
      label: 'Tags',
      description: 'Manage tags',
      href: '/tags',
    },
    {
      icon: Star,
      label: 'Favorites',
      description: 'View starred prompts',
      href: '/prompts?favorites=true',
    },
    {
      icon: Keyboard,
      label: 'Shortcuts',
      description: 'Keyboard shortcuts',
      action: () => setShortcutsHelpOpen(true),
      shortcut: '?',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <nav aria-label="Quick actions">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" role="list">
          {actions.map((action) => {
            const content = (
              <div
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-lg transition-colors text-center',
                  'hover:bg-muted cursor-pointer group',
                  action.variant === 'primary' && 'bg-primary/5 hover:bg-primary/10'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    action.variant === 'primary'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted group-hover:bg-muted-foreground/10'
                  )}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium leading-none">{action.label}</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {action.description}
                  </p>
                </div>
                {action.shortcut && (
                  <kbd className="hidden sm:inline-flex h-5 items-center justify-center rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                    {action.shortcut}
                  </kbd>
                )}
              </div>
            );

            if (action.href) {
              return (
                <div key={action.label} role="listitem">
                  <Link href={action.href} aria-label={`${action.label}: ${action.description}`}>
                    {content}
                  </Link>
                </div>
              );
            }

            return (
              <div key={action.label} role="listitem">
                <button
                  onClick={action.action}
                  className="w-full text-left"
                  aria-label={`${action.label}: ${action.description}${action.shortcut ? `. Keyboard shortcut: ${action.shortcut}` : ''}`}
                >
                  {content}
                </button>
              </div>
            );
          })}
        </div>
        </nav>
      </CardContent>
    </Card>
  );
}
