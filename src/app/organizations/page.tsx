'use client';

import { useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner, EmptyState } from '@/components/layout';
import { OrganizationCard } from '@/components/organizations';
import { Button } from '@/components/ui';
import { ErrorMessage } from '@/components/errors';
import { useAuthGuard } from '@/hooks';
import { useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { Building2, Plus } from 'lucide-react';

export default function OrganizationsPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const { data: organizations, loading, error, refetch } = useApiQuery(
    () => api.listOrganizations(),
    { enabled: isReady }
  );

  // Ensure organizations is always an array
  const organizationsList = Array.isArray(organizations) ? organizations : [];

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading organizations..." />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Organizations"
          description="Manage your team workspaces and collaborate on persona programs"
          action={
            <Button onClick={() => router.push(ROUTES.ORGANIZATIONS_NEW)} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Organization
            </Button>
          }
        />

        {error && (
          <ErrorMessage
            error={error}
            context="OrganizationsPage"
            onDismiss={refetch}
            className="mb-6"
          />
        )}

        {organizationsList.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No organizations yet"
            description="Create your first organization to start collaborating with your team"
            action={{
              label: 'Create Organization',
              onClick: () => router.push(ROUTES.ORGANIZATIONS_NEW),
            }}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizationsList.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
