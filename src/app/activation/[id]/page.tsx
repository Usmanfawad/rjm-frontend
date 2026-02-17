'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorMessage, StateBadge, Modal, Input, Textarea } from '@/components/ui';
import { useAuthGuard, useApiQuery, useApiMutation } from '@/hooks';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants';
import { Zap, ArrowLeft, CheckCircle, XCircle, Clock, Archive, Play, FileText, ArrowRight, Send, Pencil, Users, Copy } from 'lucide-react';
import type { GovernedObjectResponse, OperationalState, ApprovalType, ApprovalRecordResponse, OperationalEventResponse } from '@/types/api';

export default function ActivationObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.id as string;
  const { isReady } = useAuthGuard();

  const { data: object, loading, error, refetch } = useApiQuery(
    () => api.getGovernedObject(objectId),
    { enabled: isReady && !!objectId },
  );

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (error || !object) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.ACTIVATION)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activation
          </Button>
          {error && (
            <ErrorMessage error={error} context="ActivationDetail" onDismiss={refetch} className="mt-4" />
          )}
          {!error && !object && (
            <p className="text-center py-12 text-[var(--muted-foreground)]">Object not found.</p>
          )}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.ACTIVATION)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Activation
        </Button>

        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              {object.title || `Object ${objectId.slice(0, 8)}`}
            </div>
          }
          description={`Type: ${object.object_type.replace(/_/g, ' ')} | Version: ${object.version}`}
        />

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">State</span>
                <StateBadge state={object.current_state} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Version</span>
                <span className="text-sm font-medium">{object.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Created</span>
                <span className="text-sm">{formatDate(object.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Updated</span>
                <span className="text-sm">{formatDate(object.updated_at)}</span>
              </div>
              {object.description && (
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Description</span>
                  <p className="text-sm mt-1">{object.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                {object.is_valid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {object.is_valid ? 'Valid' : 'Validation Issues'}
                </span>
              </div>
              {object.validation_errors.length > 0 && (
                <ul className="space-y-1">
                  {object.validation_errors.map((err, i) => (
                    <li key={i} className="text-sm text-red-500">
                      {err}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
