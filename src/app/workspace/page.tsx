'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, LoadingSpinner } from '@/components/layout';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { CampaignLifecycleBadge } from '@/components/campaigns/CampaignLifecycleBadge';
import { toCampaignView } from '@/lib/campaign-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Sparkles, Zap, Clock, FileText } from 'lucide-react';
import type { CampaignView } from '@/types/api';

function CampaignModuleCard({
  campaign,
  onClick,
}: {
  campaign: CampaignView;
  onClick: () => void;
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const hasDocContext = campaign.program_json?._document_context;
  const contextStatus = hasDocContext ? 'Applied' : 'Not Applied';

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm font-medium truncate pr-2">
          {campaign.brand_name || 'Untitled Campaign'}
        </p>
        <CampaignLifecycleBadge state={campaign.lifecycle_state} />
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>{formatDate(campaign.created_at)}</span>
        <span
          className={
            contextStatus === 'Applied'
              ? 'text-green-600 dark:text-green-400'
              : 'text-[var(--muted-foreground)]'
          }
        >
          Context: {contextStatus}
        </span>
      </div>
    </button>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();

  const { data: generations } = useApiQuery(
    () => api.getPersonaGenerations(50, 0),
    { enabled: isReady },
  );

  const { data: govData } = useApiQuery(
    () => api.listGovernedObjects({ object_type: 'persona_program', limit: 100 }),
    { enabled: isReady },
  );

  const campaigns: CampaignView[] = useMemo(() => {
    if (!generations?.generations) return [];
    const govMap = new Map(
      (govData?.objects || []).map((obj) => [obj.reference_id, obj]),
    );
    return generations.generations.map((gen) =>
      toCampaignView(gen, govMap.get(gen.id) ?? null),
    );
  }, [generations, govData]);

  const activeCampaigns = useMemo(
    () => campaigns.filter((c) => ['ideation', 'draft', 'review'].includes(c.lifecycle_state)),
    [campaigns],
  );

  const readyForActivation = useMemo(
    () => campaigns.filter((c) => c.lifecycle_state === 'finalized'),
    [campaigns],
  );

  const recentlyUpdated = useMemo(
    () =>
      [...campaigns]
        .sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        })
        .slice(0, 5),
    [campaigns],
  );

  const documentContextCampaigns = useMemo(
    () => campaigns.filter((c) => c.program_json?._document_context),
    [campaigns],
  );

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading workspace..." />;
  }

  const navigateToCampaign = (id: string) => router.push(`/campaigns/${id}`);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Campaign Command Center</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            View campaign status, refine active work, and move directly to activation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Campaigns */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                Active Campaigns
                <span className="ml-auto text-sm font-normal text-[var(--muted-foreground)]">
                  {activeCampaigns.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeCampaigns.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No active campaigns.</p>
              ) : (
                <div className="space-y-2">
                  {activeCampaigns.slice(0, 5).map((c) => (
                    <CampaignModuleCard
                      key={c.id}
                      campaign={c}
                      onClick={() => navigateToCampaign(c.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ready for Activation */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-green-500" />
                Ready for Activation
                <span className="ml-auto text-sm font-normal text-[var(--muted-foreground)]">
                  {readyForActivation.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readyForActivation.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No campaigns ready for activation.</p>
              ) : (
                <div className="space-y-2">
                  {readyForActivation.slice(0, 5).map((c) => (
                    <CampaignModuleCard
                      key={c.id}
                      campaign={c}
                      onClick={() => navigateToCampaign(c.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Updated */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-5 w-5 text-blue-500" />
                Recently Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentlyUpdated.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No recent campaigns.</p>
              ) : (
                <div className="space-y-2">
                  {recentlyUpdated.map((c) => (
                    <CampaignModuleCard
                      key={c.id}
                      campaign={c}
                      onClick={() => navigateToCampaign(c.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Context Status */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-amber-500" />
                Document Context Status
                <span className="ml-auto text-sm font-normal text-[var(--muted-foreground)]">
                  {documentContextCampaigns.length} applied
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No campaigns yet.</p>
              ) : (
                <div className="space-y-2">
                  {campaigns.slice(0, 5).map((c) => (
                    <CampaignModuleCard
                      key={c.id}
                      campaign={c}
                      onClick={() => navigateToCampaign(c.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
