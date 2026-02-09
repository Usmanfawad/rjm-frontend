'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiMutation } from '@/hooks';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { Building2 } from 'lucide-react';

export default function NewOrganizationPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const { mutate: createOrganization, loading, error } = useApiMutation(
    (data: { name: string; slug?: string }) => api.createOrganization(data),
    {
      onSuccess: (data) => {
        router.push(`${ROUTES.ORGANIZATIONS}/${data.id}`);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      await createOrganization({
        name: name.trim(),
        slug: slug.trim() || undefined,
      });
    } catch (err) {
      // Error handled by useApiMutation
    }
  };

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <PageHeader
          title="Create New Organization"
          showBack
          backHref={ROUTES.ORGANIZATIONS}
        />

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create New Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <ErrorMessage
                  error={error}
                  context="NewOrganizationPage"
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
                label="Slug (optional)"
                placeholder="acme-inc"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                helperText="URL-friendly identifier. If not provided, will be generated from name."
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
                <Button type="submit" className="flex-1" size="lg" isLoading={loading}>
                  Create Organization
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
