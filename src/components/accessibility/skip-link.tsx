'use client';

import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  className?: string;
}

/**
 * Skip Navigation Link Component
 *
 * Provides keyboard users a way to skip to the main content.
 * Hidden by default, visible when focused.
 *
 * Usage:
 * - Place at the very top of your page layout
 * - Ensure the target element has the matching ID
 *
 * @example
 * <SkipLink href="#main-content" />
 * <main id="main-content">...</main>
 */
export function SkipLink({ href = '#main-content', className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default, visible on focus
        'sr-only focus:not-sr-only',
        // Positioning - fixed at top left
        'focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
        // Visual styling
        'focus:inline-flex focus:items-center focus:justify-center',
        'focus:px-4 focus:py-2 focus:rounded-md',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:text-sm focus:font-medium',
        'focus:shadow-lg focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // Animation
        'focus:animate-in focus:fade-in focus:zoom-in-95',
        // Custom classes
        className
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * Multiple Skip Links Component
 *
 * For pages with multiple main sections, provide skip links to each.
 */
interface SkipLinksProps {
  links: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  if (links.length === 0) return null;

  return (
    <div
      role="navigation"
      aria-label="Skip links"
      className={cn(
        'sr-only focus-within:not-sr-only',
        'focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-[100]',
        'focus-within:flex focus-within:flex-col focus-within:gap-2',
        'focus-within:p-3 focus-within:rounded-lg',
        'focus-within:bg-background focus-within:shadow-lg focus-within:border',
        className
      )}
    >
      <span className="text-xs font-medium text-muted-foreground px-1">
        Skip to:
      </span>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            'inline-flex items-center justify-center',
            'px-3 py-1.5 rounded-md',
            'text-sm font-medium',
            'hover:bg-muted focus:bg-primary focus:text-primary-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            'transition-colors'
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
