'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiQuery, useApiMutation } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { Building2, Save } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const { isReady } = useAuthGuard();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const { data: organization, loading: orgLoading, error: orgError } = useApiQuery(
    () => api.getOrganization(orgId),
    { enabled: isReady && !!orgId }
  );

  // Initialize form when organization loads
  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setSlug(organization.slug || '');
    }
  }, [organization]);

  const { mutate: updateOrganization, loading: updating, error: updateError } = useApiMutation(
    (data: { name?: string; slug?: string }) => api.updateOrganization(orgId, data),
    {
      onSuccess: () => {
        router.push(`${ROUTES.ORGANIZATIONS}/${orgId}`);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    try {
      await updateOrganization({
        name: name.trim(),
        slug: slug.trim() || undefined,
      });
    } catch (err) {
      // Error handled by useApiMutation
    }
  };

  if (!isReady || orgLoading) {
    return <LoadingSpinner fullScreen message="Loading organization settings..." />;
  }

  if (orgError || !organization) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title="Organization Not Found"
            showBack
            backHref={ROUTES.ORGANIZATIONS}
          />
          {orgError && (
            <ErrorMessage
              error={orgError}
              context="OrganizationSettingsPage"
              className="mb-6"
            />
          )}
        </div>
      </PageLayout>
    );
  }


  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <PageHeader
          title="Organization Settings"
          showBack
          backHref={`${ROUTES.ORGANIZATIONS}/${orgId}`}
        />

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {updateError && (
                <ErrorMessage
                  error={updateError}
                  context="OrganizationSettingsPage"
                />
              )}

              <Input
                label="Organization Name"
                placeholder="Acme Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Slug"
                placeholder="acme-inc"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                helperText="URL-friendly identifier. Changing this may affect existing links."
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" size="lg" isLoading={updating}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
