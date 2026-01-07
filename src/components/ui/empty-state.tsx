'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  FileText,
  FolderOpen,
  Tags,
  Search,
  Star,
  Trash2,
  Plus,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

// Predefined empty state configurations
const emptyStatePresets = {
  prompts: {
    icon: FileText,
    title: 'No prompts yet',
    description: 'Create your first prompt to start building your library.',
    actionLabel: 'Create Prompt',
  },
  categories: {
    icon: FolderOpen,
    title: 'No categories yet',
    description: 'Categories help you organize your prompts. Create your first category to get started.',
    actionLabel: 'Create Category',
  },
  tags: {
    icon: Tags,
    title: 'No tags yet',
    description: 'Tags help you quickly find and filter prompts. Create your first tag.',
    actionLabel: 'Create Tag',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
    actionLabel: 'Clear Search',
  },
  favorites: {
    icon: Star,
    title: 'No favorites yet',
    description: 'Star prompts you use frequently to access them quickly here.',
    actionLabel: 'Browse Prompts',
  },
  trash: {
    icon: Trash2,
    title: 'Trash is empty',
    description: 'Deleted prompts will appear here. You can restore them within 30 days.',
    actionLabel: undefined,
  },
  error: {
    icon: RefreshCw,
    title: 'Something went wrong',
    description: 'We couldn\'t load this content. Please try again.',
    actionLabel: 'Try Again',
  },
} as const;

type EmptyStatePreset = keyof typeof emptyStatePresets;

interface EmptyStateProps {
  /** Use a preset configuration */
  preset?: EmptyStatePreset;
  /** Custom icon (overrides preset) */
  icon?: LucideIcon;
  /** Title text (overrides preset) */
  title?: string;
  /** Description text (overrides preset) */
  description?: string;
  /** Primary action button label (overrides preset) */
  actionLabel?: string;
  /** Primary action callback */
  onAction?: () => void;
  /** Secondary action button label */
  secondaryActionLabel?: string;
  /** Secondary action callback */
  onSecondaryAction?: () => void;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Additional class names */
  className?: string;
  /** Custom children to render below the description */
  children?: React.ReactNode;
}

export function EmptyState({
  preset,
  icon: customIcon,
  title: customTitle,
  description: customDescription,
  actionLabel: customActionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  size = 'default',
  className,
  children,
}: EmptyStateProps) {
  // Get preset values if preset is specified
  const presetConfig = preset ? emptyStatePresets[preset] : null;

  // Use custom values or fall back to preset
  const Icon = customIcon || presetConfig?.icon || FileText;
  const title = customTitle || presetConfig?.title || 'Nothing here yet';
  const description = customDescription || presetConfig?.description;
  const actionLabel = customActionLabel ?? presetConfig?.actionLabel;

  // Size-based classes
  const sizeClasses = {
    sm: {
      container: 'py-6',
      iconWrapper: 'h-12 w-12 mb-3',
      icon: 'h-6 w-6',
      title: 'text-base',
      description: 'text-xs',
    },
    default: {
      container: 'py-12',
      iconWrapper: 'h-16 w-16 mb-4',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'h-20 w-20 mb-5',
      icon: 'h-10 w-10',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        sizes.container,
        className
      )}
      role="status"
      aria-label={title}
    >
      {/* Icon with subtle background */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted',
          sizes.iconWrapper
        )}
      >
        <Icon className={cn('text-muted-foreground', sizes.icon)} />
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold text-foreground', sizes.title)}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'mt-2 max-w-sm text-muted-foreground',
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {/* Custom children */}
      {children && <div className="mt-4">{children}</div>}

      {/* Action buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button onClick={onAction} size={size === 'sm' ? 'sm' : 'default'}>
              <Plus className="mr-2 h-4 w-4" />
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Compound component for more complex empty states
interface EmptyStateRootProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

function EmptyStateRoot({ children, className, size = 'default' }: EmptyStateRootProps) {
  const sizeClasses = {
    sm: 'py-6',
    default: 'py-12',
    lg: 'py-16',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        sizeClasses[size],
        className
      )}
      role="status"
    >
      {children}
    </div>
  );
}

interface EmptyStateIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

function EmptyStateIcon({ icon: Icon, size = 'default', className }: EmptyStateIconProps) {
  const sizeClasses = {
    sm: { wrapper: 'h-12 w-12 mb-3', icon: 'h-6 w-6' },
    default: { wrapper: 'h-16 w-16 mb-4', icon: 'h-8 w-8' },
    lg: { wrapper: 'h-20 w-20 mb-5', icon: 'h-10 w-10' },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-muted',
        sizes.wrapper,
        className
      )}
    >
      <Icon className={cn('text-muted-foreground', sizes.icon)} />
    </div>
  );
}

interface EmptyStateTitleProps {
  children: React.ReactNode;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

function EmptyStateTitle({ children, size = 'default', className }: EmptyStateTitleProps) {
  const sizeClasses = {
    sm: 'text-base',
    default: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <h3 className={cn('font-semibold text-foreground', sizeClasses[size], className)}>
      {children}
    </h3>
  );
}

interface EmptyStateDescriptionProps {
  children: React.ReactNode;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

function EmptyStateDescription({ children, size = 'default', className }: EmptyStateDescriptionProps) {
  const sizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
  };

  return (
    <p className={cn('mt-2 max-w-sm text-muted-foreground', sizeClasses[size], className)}>
      {children}
    </p>
  );
}

interface EmptyStateActionsProps {
  children: React.ReactNode;
  className?: string;
}

function EmptyStateActions({ children, className }: EmptyStateActionsProps) {
  return (
    <div className={cn('mt-6 flex flex-wrap items-center justify-center gap-3', className)}>
      {children}
    </div>
  );
}

// Export compound components
EmptyState.Root = EmptyStateRoot;
EmptyState.Icon = EmptyStateIcon;
EmptyState.Title = EmptyStateTitle;
EmptyState.Description = EmptyStateDescription;
EmptyState.Actions = EmptyStateActions;
