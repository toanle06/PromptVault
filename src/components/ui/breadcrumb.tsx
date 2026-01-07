'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route label mappings
const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'prompts': 'Prompts',
  'categories': 'Categories',
  'tags': 'Tags',
  'settings': 'Settings',
  'trash': 'Trash',
  'new': 'New Prompt',
};

export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items) return items;

    const segments = pathname.split('/').filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Check if this is a dynamic segment (like an ID)
      const isDynamicSegment = segment.match(/^[a-zA-Z0-9]{20,}$/);

      if (isDynamicSegment) {
        // For dynamic segments, don't add a link and show as "Details"
        generatedItems.push({
          label: 'Details',
          href: isLast ? undefined : currentPath,
        });
      } else {
        generatedItems.push({
          label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : currentPath,
        });
      }
    });

    return generatedItems;
  }, [items, pathname]);

  // Don't render if we're on the home page or only have one item
  if (pathname === '/' || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center gap-1.5">
        {showHome && (
          <>
            <li>
              <Link
                href="/"
                className="flex items-center hover:text-foreground transition-colors"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
          </>
        )}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={index}>
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(isLast && 'text-foreground font-medium')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook for custom breadcrumb context
interface BreadcrumbContextValue {
  setCustomBreadcrumbs: (items: BreadcrumbItem[] | null) => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [customBreadcrumbs, setCustomBreadcrumbs] = React.useState<BreadcrumbItem[] | null>(null);

  return (
    <BreadcrumbContext.Provider value={{ setCustomBreadcrumbs }}>
      {children}
      {/* This would be rendered in a layout */}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = React.useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
}
