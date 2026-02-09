'use client';

import { cn } from '@/lib/utils';
import type { OperationalState } from '@/types/api';
import { HTMLAttributes } from 'react';

interface StateBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  state: OperationalState;
}

export function StateBadge({ className, state, ...props }: StateBadgeProps) {
  const stateConfig: Record<
    OperationalState,
    { label: string; className: string }
  > = {
    draft: {
      label: 'Draft',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    },
    approved: {
      label: 'Approved',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    requested_for_activation: {
      label: 'Requested for Activation',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    live: {
      label: 'Live',
      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    },
    archived: {
      label: 'Archived',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const config = stateConfig[state];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
      {...props}
    >
      {config.label}
    </span>
  );
}
