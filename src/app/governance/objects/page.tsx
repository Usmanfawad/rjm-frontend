'use client';

import { useState, useMemo } from 'react';
import { PageLayout, PageHeader, LoadingSpinner, EmptyState } from '@/components/layout';
import { StateBadge, Card, CardContent, Button, ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import type { OperationalState, GovernedObjectType } from '@/types/api';
import { API_CONFIG } from '@/constants';
import { Shield, Filter } from 'lucide-react';
import Link from 'next/link';

const OPERATIONAL_STATES: (OperationalState | 'all')[] = [
  'all',
  'draft',
  'approved',
  'requested_for_activation',
  'in_progress',
  'live',
  'archived',
];

const GOVERNED_OBJECT_TYPES: (GovernedObjectType | 'all')[] = [
  'all',
  'persona_program',
  'custom_persona',
  'activation_plan',
  'campaign_package',
  'document',
  'external_execution_request',
];

export default function GovernedObjectsPage() {
  const { isReady } = useAuthGuard();
  const [stateFilter, setStateFilter] = useState<OperationalState | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<GovernedObjectType | 'all'>('all');

  const { data: objectsData, loading, error, refetch } = useApiQuery(
    () => api.listGovernedObjects({
      state: stateFilter !== 'all' ? stateFilter : undefined,
      object_type: typeFilter !== 'all' ? typeFilter : undefined,
      limit: API_CONFIG.DEFAULT_LIMIT,
    }),
    { enabled: isReady }
  );

  const objects = objectsData?.objects || [];

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading governed objects..." />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Governed Objects
            </div>
          }
          description="All objects under governance workflow"
        />

        {/* Filters */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
                <span className="text-sm font-medium">State:</span>
                <div className="flex gap-2">
                  {OPERATIONAL_STATES.map((state) => (
                    <Button
                      key={state}
                      variant={stateFilter === state ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setStateFilter(state)}
                    >
                      {state === 'all' ? 'All' : state.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Type:</span>
                <div className="flex gap-2">
                  {GOVERNED_OBJECT_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={typeFilter === type ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setTypeFilter(type)}
                    >
                      {type === 'all' ? 'All' : type.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <ErrorMessage
            error={error}
            context="GovernedObjectsPage"
            onDismiss={refetch}
            className="mb-6"
          />
        )}

        {objects.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No governed objects"
            description="Register objects from your programs or documents to start governance workflow"
          />
        ) : (
          <div className="space-y-3">
            {objects.map((obj) => (
              <Link key={obj.id} href={`/governance/${obj.id}`}>
                <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{obj.title || 'Untitled'}</h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                          {obj.object_type.replace(/_/g, ' ')} • v{obj.version}
                          {obj.org_id && ` • Org: ${obj.org_id.slice(0, 8)}...`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StateBadge state={obj.current_state} />
                        {!obj.is_valid && (
                          <span className="text-xs text-[var(--error)]">Invalid</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
