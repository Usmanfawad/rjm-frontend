'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiQuery, useApiMutation } from '@/hooks';
import { clearQueryCache } from '@/hooks/useApiQuery';
import { api } from '@/lib/api';
import type { MemberRole } from '@/types/api';
import { ROUTES } from '@/constants';
import { UserPlus } from 'lucide-react';

export default function InviteMemberPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;
  const { isReady } = useAuthGuard();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('member');

  const { data: organization } = useApiQuery(
    () => api.getOrganization(orgId),
    { enabled: isReady && !!orgId }
  );

  const { mutate: inviteMember, loading, error } = useApiMutation(
    (data: { email: string; role: MemberRole }) => api.inviteMember(orgId, data),
    {
      onSuccess: () => {
        // Clear the members list cache to force a fresh fetch
        clearQueryCache(() => api.listMembers(orgId));
        // Navigate back to organization detail page
        router.push(`${ROUTES.ORGANIZATIONS}/${orgId}`);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    try {
      await inviteMember({ email: email.trim(), role });
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
          title={
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Member
              {organization && (
                <span className="text-sm font-normal text-[var(--muted-foreground)]">
                  to {organization.name}
                </span>
              )}
            </div>
          }
          showBack
          backHref={`${ROUTES.ORGANIZATIONS}/${orgId}`}
        />

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <ErrorMessage
                  error={error}
                  context="InviteMemberPage"
                />
              )}

              <div className="text-sm text-[var(--muted-foreground)] mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-medium mb-1">Note:</p>
                <p>The person you invite must already have an account. If they don't have an account, they'll need to sign up first.</p>
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="viewer">Viewer - Read-only access</option>
                  <option value="member">Member - Can create and edit</option>
                  <option value="admin">Admin - Can manage members and settings</option>
                  <option value="owner">Owner - Full control</option>
                </select>
              </div>

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
                  Send Invitation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
