'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { PageLayout, LoadingSpinner, EmptyState } from '@/components/layout';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { CampaignCard } from '@/components/campaigns';
import { toCampaignView } from '@/lib/campaign-utils';
import { cn } from '@/lib/utils';
import type { CampaignLifecycleState, CampaignView } from '@/types/api';

const FILTER_TABS: { key: CampaignLifecycleState | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ideation', label: 'Ideation' },
  { key: 'draft', label: 'Draft' },
  { key: 'review', label: 'Review' },
  { key: 'finalized', label: 'Finalized' },
  { key: 'activated', label: 'Activated' },
  { key: 'archived', label: 'Archived' },
];

export default function CampaignsPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const [activeFilter, setActiveFilter] = useState<CampaignLifecycleState | 'all'>('all');

  const { data: generations, loading: genLoading, error } = useApiQuery(
    () => api.getPersonaGenerations(100, 0),
    { enabled: isReady },
  );

  // Fetch governance objects to link with generations
  const { data: govData, loading: govLoading } = useApiQuery(
    () => api.listGovernedObjects({ object_type: 'persona_program', limit: 100 }),
    { enabled: isReady },
  );

  const loading = genLoading || govLoading;

  // Build CampaignView list with governance linkage
  const campaigns: CampaignView[] = useMemo(() => {
    if (!generations?.generations) return [];
    const govMap = new Map(
      (govData?.objects || []).map((obj) => [obj.reference_id, obj]),
    );
    return generations.generations.map((gen) =>
      toCampaignView(gen, govMap.get(gen.id) ?? null),
    );
  }, [generations, govData]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return campaigns;
    return campaigns.filter((c) => c.lifecycle_state === activeFilter);
  }, [campaigns, activeFilter]);

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading campaigns..." />;
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Build, refine, and activate persona-driven campaigns.
            </p>
          </div>
          <button
            onClick={() => router.push(ROUTES.CAMPAIGNS_NEW)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Build Campaign
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                activeFilter === tab.key
                  ? 'border-[var(--primary)] text-[var(--foreground)]'
                  : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Loading campaigns..." />
        ) : error ? (
          <p className="text-center py-12 text-red-500">Failed to load campaigns.</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No campaigns yet"
            description="Create your first persona program to get started."
            action={{
              label: 'Build Campaign',
              onClick: () => router.push(ROUTES.CAMPAIGNS_NEW),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
