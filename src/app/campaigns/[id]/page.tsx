'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout, LoadingSpinner } from '@/components/layout';
import { Button } from '@/components/ui';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { CampaignDetail } from '@/components/campaigns';
import { toCampaignView } from '@/lib/campaign-utils';
import { ArrowLeft } from 'lucide-react';
import type { GovernedObjectResponse } from '@/types/api';

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const { toast } = useToast();

  // Track governance object locally so we can update after register/transition
  const [governedObj, setGovernedObj] = useState<GovernedObjectResponse | null>(null);
  const [govLoaded, setGovLoaded] = useState(false);

  // Fetch generations
  const { data: generations, loading: genLoading } = useApiQuery(
    () => api.getPersonaGenerations(100, 0),
    { enabled: isReady },
  );

  // Fetch all governed objects to find one linked to this generation
  const { data: govData, loading: govLoading } = useApiQuery(
    () => api.listGovernedObjects({ object_type: 'persona_program', limit: 100 }),
    { enabled: isReady },
  );

  // Find governed object for this generation
  useMemo(() => {
    if (govData?.objects && id && !govLoaded) {
      const match = govData.objects.find(
        (obj) => obj.reference_id === id,
      );
      if (match) setGovernedObj(match);
      setGovLoaded(true);
    }
  }, [govData, id, govLoaded]);

  const generation = generations?.generations?.find((g) => g.id === id);

  // Build campaign view with governance linkage
  const campaign = useMemo(() => {
    if (!generation) return null;
    return toCampaignView(generation, governedObj);
  }, [generation, governedObj]);

  // Register for governance
  const handleRegister = useCallback(async () => {
    if (!generation) return;
    const title = generation.program_json?.header
      ? `${generation.program_json.header} - ${new Date().toLocaleDateString()}`
      : `${generation.brand_name} Campaign`;

    const res = await api.registerObject({
      object_type: 'persona_program',
      reference_id: generation.id,
      reference_table: 'persona_generations',
      title,
      description: `Persona program for ${generation.brand_name}`,
    });

    if (res.success && res.data) {
      setGovernedObj(res.data);
      toast('Campaign registered for activation.', 'success');
    } else {
      toast(res.message || 'Failed to register campaign.', 'error');
    }
  }, [generation, toast]);

  // Transition governance state
  const handleTransition = useCallback(async (toState: string) => {
    if (!governedObj) return;

    // The "approved" transition should use the approve endpoint for proper audit trail
    if (toState === 'approved' && governedObj.current_state === 'draft') {
      const res = await api.approveObject(governedObj.id, {
        approval_type: 'strategic',
        notes: 'Approved via Campaigns UI',
      });
      if (res.success && res.data) {
        setGovernedObj(res.data);
        toast('Campaign submitted for review.', 'success');
      } else {
        toast(res.message || 'Failed to submit for review.', 'error');
      }
      return;
    }

    // All other transitions use the transition endpoint
    const res = await api.transitionState(governedObj.id, {
      to_state: toState as any,
      reason: toState === 'archived' ? 'Archived via Campaigns UI' : undefined,
    });
    if (res.success && res.data) {
      setGovernedObj(res.data.object);
      const labels: Record<string, string> = {
        requested_for_activation: 'Campaign finalized.',
        in_progress: 'Campaign sent to activation.',
        live: 'Campaign is now live.',
        archived: 'Campaign archived.',
      };
      toast(labels[toState] || 'State updated.', 'success');
    } else {
      toast(res.message || 'Failed to update state.', 'error');
    }
  }, [governedObj, toast]);

  if (!isReady || genLoading || govLoading) {
    return <LoadingSpinner fullScreen message="Loading campaign..." />;
  }

  if (!generation || !campaign) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-[var(--muted-foreground)]">Campaign not found.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.CAMPAIGNS)}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.CAMPAIGNS)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Campaigns
        </Button>

        <CampaignDetail
          campaign={campaign}
          onRegister={handleRegister}
          onTransition={handleTransition}
        />
      </div>
    </PageLayout>
  );
}
