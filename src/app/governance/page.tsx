'use client';

import { useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { GovernanceDashboard } from '@/components/governance';
import { Button, ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { Shield, Plus } from 'lucide-react';

export default function GovernancePage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const { data: dashboard, loading, error, refetch } = useApiQuery(
    () => api.getDashboard(),
    { enabled: isReady }
  );

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading governance dashboard..." />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Governance Dashboard
            </div>
          }
          description="Manage the lifecycle of your persona programs and ensure quality through approval workflows"
          action={
            <Button onClick={() => router.push(ROUTES.GOVERNANCE_OBJECTS)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              View All Objects
            </Button>
          }
        />

        {error && (
          <ErrorMessage
            error={error}
            context="GovernancePage"
            onDismiss={refetch}
            className="mb-6"
          />
        )}

        {dashboard && <GovernanceDashboard dashboard={dashboard} />}
      </div>
    </PageLayout>
  );
}
