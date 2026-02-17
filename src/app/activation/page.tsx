'use client';

import { useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { GovernanceDashboard } from '@/components/governance';
import { ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { Zap } from 'lucide-react';

export default function ActivationPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const { data: dashboard, loading, error, refetch } = useApiQuery(
    () => api.getDashboard(),
    { enabled: isReady },
  );

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading activation dashboard..." />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8" />
              Activation
            </div>
          }
          description="Manage the lifecycle of your campaigns from draft through activation"
        />

        {error && (
          <ErrorMessage
            error={error}
            context="ActivationPage"
            onDismiss={refetch}
            className="mb-6"
          />
        )}

        {dashboard && <GovernanceDashboard dashboard={dashboard} />}
      </div>
    </PageLayout>
  );
}
