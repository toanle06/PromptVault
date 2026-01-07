'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-muted-foreground',
  description,
  trend,
  className,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.isPositive === undefined) {
      // Default behavior: positive numbers are good
      return trend.value > 0 ? 'text-green-500' : trend.value < 0 ? 'text-red-500' : 'text-muted-foreground';
    }
    // Custom behavior based on isPositive
    return trend.isPositive ? 'text-green-500' : 'text-red-500';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && TrendIcon && (
              <div className={cn('flex items-center gap-0.5 text-xs', getTrendColor())}>
                <TrendIcon className="h-3 w-3" />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            {trend?.label && (
              <p className="text-xs text-muted-foreground">
                {trend.label}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact stat for inline use
interface CompactStatProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  className?: string;
}

export function CompactStat({ label, value, icon: Icon, className }: CompactStatProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
