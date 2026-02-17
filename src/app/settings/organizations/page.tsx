'use client';

import { useRouter } from 'next/navigation';
import { LoadingSpinner, EmptyState } from '@/components/layout';
import { OrganizationCard } from '@/components/organizations';
import { Button } from '@/components/ui';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { Building2, Plus } from 'lucide-react';

export default function SettingsOrganizationsPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const { data: organizations, loading } = useApiQuery(
    () => api.listOrganizations(),
    { enabled: isReady },
  );

  if (!isReady || loading) {
    return <LoadingSpinner message="Loading organizations..." />;
  }

  const orgs = Array.isArray(organizations) ? organizations : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Organizations</h2>
        <Button size="sm" onClick={() => router.push(ROUTES.SETTINGS_ORGANIZATIONS_NEW)}>
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      {orgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Create your first organization to collaborate with your team."
          action={{
            label: 'Create Organization',
            onClick: () => router.push(ROUTES.SETTINGS_ORGANIZATIONS_NEW),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="cursor-pointer"
              onClick={() => router.push(`/settings/organizations/${org.id}`)}
            >
              <OrganizationCard organization={org} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
