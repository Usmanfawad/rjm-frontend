'use client';

import { ReactNode } from 'react';
import { Card, CardContent, Button } from '@/components/ui';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Standardized empty state component
 * Provides consistent empty states across the app
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <Card variant="elevated" className={className}>
      <CardContent className="p-12 text-center">
        <Icon className="h-16 w-16 mx-auto text-[var(--muted-foreground)] mb-4" />
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-[var(--muted-foreground)] mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
