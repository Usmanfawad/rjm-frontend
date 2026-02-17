'use client';

import { cn } from '@/lib/utils';
import { LIFECYCLE_COLORS, LIFECYCLE_LABELS } from '@/lib/campaign-utils';
import type { CampaignLifecycleState } from '@/types/api';

interface CampaignLifecycleBadgeProps {
  state: CampaignLifecycleState;
  className?: string;
}

export function CampaignLifecycleBadge({ state, className }: CampaignLifecycleBadgeProps) {
  const colors = LIFECYCLE_COLORS[state];
  const label = LIFECYCLE_LABELS[state];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {label}
    </span>
  );
}
