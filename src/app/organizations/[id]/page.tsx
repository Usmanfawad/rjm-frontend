'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { MemberList } from '@/components/organizations';
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants';
import { Building2, Settings, UserPlus } from 'lucide-react';

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const { isReady } = useAuthGuard();
  const { user } = useAuth();

  const { data: organization, loading: orgLoading, error: orgError } = useApiQuery(
    () => api.getOrganization(orgId),
    { enabled: isReady && !!orgId }
  );

  const { data: members, loading: membersLoading, error: membersError, refetch: refetchMembers } = useApiQuery(
    () => api.listMembers(orgId),
    { enabled: isReady && !!orgId }
  );

  // Find current user's role in the organization
  const currentUserMember = members?.find(m => m.user_id === user?.id);
  const currentUserRole = currentUserMember?.role;

  // Refetch members when the page becomes visible (e.g., after navigation back from invite)
  useEffect(() => {
    if (isReady && orgId) {
      const handleFocus = () => {
        // Refetch when window regains focus (e.g., after navigation)
        refetchMembers();
      };
      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isReady, orgId, refetchMembers]);

  const loading = orgLoading || membersLoading;
  const error = orgError || membersError;

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading organization..." />;
  }

  if (error || !organization) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title="Organization Not Found"
            showBack
            backHref={ROUTES.ORGANIZATIONS}
          />
          {error && (
            <ErrorMessage
              error={error}
              context="OrganizationDetailPage"
              className="mb-6"
            />
          )}
          {!error && !organization && (
            <Card variant="elevated">
              <CardContent className="p-6 text-center">
                <p className="text-[var(--muted-foreground)] mb-4">
                  The organization you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => router.push(ROUTES.ORGANIZATIONS)}>
                  Back to Organizations
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{organization.name}</h1>
                <p className="text-[var(--muted-foreground)]">{organization.slug}</p>
              </div>
            </div>
          }
          showBack
          backHref={ROUTES.ORGANIZATIONS}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`${ROUTES.ORGANIZATIONS}/${orgId}/invite`)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
              <Button variant="outline" onClick={() => router.push(`${ROUTES.ORGANIZATIONS}/${orgId}/settings`)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          }
        />

        <div className="grid lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">Name</label>
                <p className="mt-1">{organization?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">Slug</label>
                <p className="mt-1">{organization?.slug || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)]">Created</label>
                <p className="mt-1">{organization?.created_at ? formatDate(organization.created_at) : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {membersError ? (
            <Card variant="elevated">
              <CardContent className="p-6">
                <ErrorMessage
                  error={membersError}
                  context="MemberList"
                />
              </CardContent>
            </Card>
          ) : (
            <MemberList
              members={Array.isArray(members) ? members : []}
              orgId={orgId}
              currentUserId={user?.id}
              currentUserRole={currentUserRole}
              onMemberRemoved={refetchMembers}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
