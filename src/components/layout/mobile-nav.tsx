'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { usePromptStore } from '@/store/prompt-store';
import {
  Home,
  FileText,
  Plus,
  Star,
  Settings,
} from 'lucide-react';

const navItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Prompts',
    href: '/prompts',
    icon: FileText,
  },
  {
    title: 'New',
    href: '#new',
    icon: Plus,
    isAction: true,
  },
  {
    title: 'Favorites',
    href: '/prompts?favorites=true',
    icon: Star,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { setCreatePromptOpen } = useUIStore();
  const { prompts } = usePromptStore();

  const favoriteCount = prompts.filter((p) => p.isFavorite && !p.isDeleted).length;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.includes('?')) {
      const [path, query] = href.split('?');
      return pathname === path && typeof window !== 'undefined' && window.location.search.includes(query.split('=')[1]);
    }
    return pathname.startsWith(href);
  };

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.isAction) {
      e.preventDefault();
      setCreatePromptOpen(true);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t safe-area-inset-bottom"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = !item.isAction && isActive(item.href);
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.title}
                onClick={(e) => handleNavClick(item, e)}
                className="flex flex-col items-center justify-center min-w-[64px] h-full tap-highlight-transparent"
                aria-label="Create new prompt"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg -mt-6 transition-transform active:scale-95">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium mt-1 text-muted-foreground">
                  {item.title}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] h-full tap-highlight-transparent transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={cn('h-6 w-6', active && 'stroke-[2.5]')} />
                {item.title === 'Favorites' && favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                    {favoriteCount > 99 ? '99+' : favoriteCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] mt-1',
                active ? 'font-semibold' : 'font-medium'
              )}>
                {item.title}
              </span>
              {active && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
