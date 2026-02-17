'use client';

import Link from 'next/link';
import { Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CampaignLifecycleBadge } from './CampaignLifecycleBadge';
import type { CampaignView } from '@/types/api';

interface CampaignCardProps {
  campaign: CampaignView;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const briefExcerpt =
    campaign.brief.length > 120
      ? campaign.brief.slice(0, 120) + '...'
      : campaign.brief;

  const date = new Date(campaign.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card
        variant="elevated"
        className="p-5 hover:border-[var(--foreground)] transition-colors cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[var(--foreground)] truncate">
              {campaign.brand_name}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
              {briefExcerpt}
            </p>
          </div>
          <CampaignLifecycleBadge state={campaign.lifecycle_state} />
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </span>
          {campaign.governance_version && campaign.governance_version > 1 && (
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              v{campaign.governance_version}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
