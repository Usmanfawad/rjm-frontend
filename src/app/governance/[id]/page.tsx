'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorMessage, StateBadge, Modal, Input, Textarea } from '@/components/ui';
import { useAuthGuard, useApiQuery, useApiMutation } from '@/hooks';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants';
import { Shield, ArrowLeft, CheckCircle, XCircle, Clock, Archive, Play, FileText, ArrowRight, Send, Pencil, Users, Copy } from 'lucide-react';
import type { GovernedObjectResponse, OperationalState, ApprovalType, ApprovalRecordResponse, OperationalEventResponse } from '@/types/api';

export default function GovernanceObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = params.id as string;
  const { isReady } = useAuthGuard();

  const { data: object, loading, error, refetch } = useApiQuery(
    () => api.getGovernedObject(objectId),
    { enabled: isReady && !!objectId }
  );

  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [targetState, setTargetState] = useState<OperationalState | null>(null);
  const [transitionReason, setTransitionReason] = useState('');
  const [approvalType, setApprovalType] = useState<ApprovalType>('strategic');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferUserId, setTransferUserId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const { data: approvalsData } = useApiQuery(
    () => api.getApprovals(objectId),
    { enabled: isReady && !!objectId }
  );

  const { data: eventsData } = useApiQuery(
    () => api.getEventHistory(objectId),
    { enabled: isReady && !!objectId }
  );

  const approvals: ApprovalRecordResponse[] = approvalsData?.approvals || [];
  const events: OperationalEventResponse[] = eventsData?.events || [];

  const { mutate: transitionState, loading: transitioning } = useApiMutation(
    (data: { to_state: OperationalState; reason?: string }) => api.transitionState(objectId, data),
    {
      onSuccess: () => {
        setShowTransitionModal(false);
        setTransitionReason('');
        refetch();
      },
    }
  );

  const { mutate: approveObject, loading: approving } = useApiMutation(
    (data: { approval_type: ApprovalType; notes?: string }) => api.approveObject(objectId, data),
    {
      onSuccess: () => {
        setShowApprovalModal(false);
        setApprovalNotes('');
        refetch();
      },
    }
  );

  const { mutate: updateObject, loading: updating } = useApiMutation(
    (data: { title?: string; description?: string }) => api.updateGovernedObject(objectId, data),
    {
      onSuccess: () => {
        setShowEditModal(false);
        refetch();
      },
    }
  );

  const { mutate: transferOwnership, loading: transferring } = useApiMutation(
    (data: { to_user_id: string; reason?: string }) => api.transferOwnership(objectId, data),
    {
      onSuccess: () => {
        setShowTransferModal(false);
        setTransferUserId('');
        setTransferReason('');
        refetch();
      },
    }
  );

  const { mutate: supersedeObject, loading: superseding } = useApiMutation(
    () => api.supersedeObject(objectId),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  // Get valid next states based on current state
  // Must match backend VALID_TRANSITIONS in models/operationalization.py
  const getNextStates = (currentState: OperationalState): OperationalState[] => {
    switch (currentState) {
      case 'draft':
        return ['approved', 'archived'];
      case 'approved':
        return ['requested_for_activation', 'archived'];
      case 'requested_for_activation':
        return ['in_progress', 'archived'];
      case 'in_progress':
        return ['live', 'archived'];
      case 'live':
        return ['archived'];
      case 'archived':
        return [];
      default:
        return [];
    }
  };

  const handleTransition = (toState: OperationalState) => {
    setTargetState(toState);
    setShowTransitionModal(true);
  };

  const handleConfirmTransition = () => {
    if (targetState) {
      transitionState({
        to_state: targetState,
        reason: transitionReason || undefined,
      });
    }
  };

  const handleApprove = () => {
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = () => {
    approveObject({
      approval_type: approvalType,
      notes: approvalNotes || undefined,
    });
  };

  const nextStates = object ? getNextStates(object.current_state) : [];

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading governance object..." />;
  }

  if (error || !object) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title="Object Not Found"
            showBack
            backHref={ROUTES.GOVERNANCE_OBJECTS}
          />
          {error && (
            <ErrorMessage
              error={error}
              context="GovernanceObjectDetailPage"
              className="mb-6"
            />
          )}
          {!error && !object && (
            <Card variant="elevated">
              <CardContent className="p-6 text-center">
                <p className="text-[var(--muted-foreground)] mb-4">
                  The governance object you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => router.push(ROUTES.GOVERNANCE_OBJECTS)}>
                  Back to Governed Objects
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
    );
  }

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'approved':
        return CheckCircle;
      case 'live':
        return Play;
      case 'archived':
        return Archive;
      case 'in_progress':
        return Clock;
      default:
        return FileText;
    }
  };

  const StateIcon = getStateIcon(object.current_state);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{object.title || 'Untitled Object'}</h1>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {object.object_type.replace(/_/g, ' ')} • Version {object.version}
                </p>
              </div>
            </div>
          }
          showBack
          backHref={ROUTES.GOVERNANCE_OBJECTS}
        />

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Object Details */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Object Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">Type</label>
                  <p className="mt-1 capitalize">{object.object_type.replace(/_/g, ' ')}</p>
                </div>
                {object.description && (
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Description</label>
                    <p className="mt-1">{object.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">Reference ID</label>
                  <p className="mt-1 font-mono text-sm">{object.reference_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">Reference Table</label>
                  <p className="mt-1">{object.reference_table}</p>
                </div>
                {object.metadata && Object.keys(object.metadata).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Metadata</label>
                    <pre className="mt-1 p-3 rounded-lg bg-[var(--muted)] text-xs overflow-auto">
                      {JSON.stringify(object.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation Status */}
            {!object.is_valid && object.validation_errors.length > 0 && (
              <Card variant="elevated" className="border-[var(--error)]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--error)]">
                    <XCircle className="h-5 w-5" />
                    Validation Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {object.validation_errors.map((error, idx) => (
                      <li key={idx} className="text-sm text-[var(--error)]">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Approvals */}
            {approvals.length > 0 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Approvals ({approvals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {approvals.map((approval) => (
                      <div key={approval.id} className="p-3 rounded-lg bg-[var(--accent)] border border-[var(--border)]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{approval.approval_type}</span>
                          <span className="text-xs text-[var(--muted-foreground)]">{formatDate(approval.approved_at)}</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          By: <span className="font-mono">{approval.approved_by.slice(0, 8)}...</span>
                        </p>
                        {approval.notes && (
                          <p className="text-xs mt-1">{approval.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event History */}
            {events.length > 0 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Event History ({events.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-1.5" />
                          <div className="w-px flex-1 bg-[var(--border)]" />
                        </div>
                        <div className="pb-3">
                          <p className="text-sm font-medium capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                          {event.from_state && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {event.from_state.replace(/_/g, ' ')} → {event.to_state.replace(/_/g, ' ')}
                            </p>
                          )}
                          {event.reason && (
                            <p className="text-xs mt-0.5">{event.reason}</p>
                          )}
                          <p className="text-xs text-[var(--muted-foreground)] mt-1">{formatDate(event.occurred_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StateIcon className="h-5 w-5" />
                  Current State
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <StateBadge state={object.current_state} />
                </div>
                {object.is_valid && (
                  <div className="mt-4 p-3 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
                    <p className="text-sm text-[var(--success)] flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Object is valid
                    </p>
                  </div>
                )}

                {/* State Transition Actions */}
                {nextStates.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[var(--border)]">
                    <p className="text-xs font-medium text-[var(--muted-foreground)] mb-3">
                      Next Actions
                    </p>
                    <div className="space-y-2">
                      {object.current_state === 'draft' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={handleApprove}
                          disabled={approving}
                          isLoading={approving}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Request Approval
                        </Button>
                      )}
                      {nextStates.map((state) => (
                        <Button
                          key={state}
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleTransition(state)}
                          disabled={transitioning}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Move to {state.replace(/_/g, ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lifecycle Info */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Lifecycle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Created</label>
                  <p className="text-sm mt-1">{formatDate(object.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Updated</label>
                  <p className="text-sm mt-1">{formatDate(object.updated_at)}</p>
                </div>
                {object.approved_at && (
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Approved</label>
                    <p className="text-sm mt-1">{formatDate(object.approved_at)}</p>
                  </div>
                )}
                {object.activated_at && (
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Activated</label>
                    <p className="text-sm mt-1">{formatDate(object.activated_at)}</p>
                  </div>
                )}
                {object.archived_at && (
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Archived</label>
                    <p className="text-sm mt-1">{formatDate(object.archived_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {object.current_state === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEditTitle(object.title || '');
                      setEditDescription(object.description || '');
                      setShowEditModal(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Object
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowTransferModal(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Transfer Ownership
                </Button>
                {object.current_state !== 'archived' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => supersedeObject(undefined as any)}
                    disabled={superseding}
                    isLoading={superseding}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Create New Version
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Ownership Info */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Ownership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Creator</label>
                  <p className="text-sm mt-1 font-mono">{object.creator_id.slice(0, 8)}...</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Current Responsible</label>
                  <p className="text-sm mt-1 font-mono">{object.current_responsible_id.slice(0, 8)}...</p>
                </div>
                {object.approver_id && (
                  <div>
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">Approver</label>
                    <p className="text-sm mt-1 font-mono">{object.approver_id.slice(0, 8)}...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      

      {/* State Transition Modal */}
      <Modal
        isOpen={showTransitionModal}
        onClose={() => {
          setShowTransitionModal(false);
          setTransitionReason('');
        }}
        title={`Transition to ${targetState?.replace(/_/g, ' ')}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Are you sure you want to transition this object to{' '}
            <span className="font-medium text-[var(--foreground)]">
              {targetState?.replace(/_/g, ' ')}
            </span>
            ?
          </p>
          <Textarea
            label="Reason (optional)"
            placeholder="Provide a reason for this state transition..."
            value={transitionReason}
            onChange={(e) => setTransitionReason(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTransitionModal(false);
                setTransitionReason('');
              }}
              disabled={transitioning}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmTransition}
              disabled={transitioning}
              isLoading={transitioning}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Confirm Transition
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Object Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Object"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Object title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Object description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={updating}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => updateObject({ title: editTitle || undefined, description: editDescription || undefined })}
              disabled={updating}
              isLoading={updating}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transfer Ownership Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => { setShowTransferModal(false); setTransferUserId(''); setTransferReason(''); }}
        title="Transfer Ownership"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Transfer responsibility for this object to another user.
          </p>
          <Input
            label="User ID"
            placeholder="Enter the target user's ID"
            value={transferUserId}
            onChange={(e) => setTransferUserId(e.target.value)}
          />
          <Textarea
            label="Reason (optional)"
            placeholder="Reason for transfer..."
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
            rows={2}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => { setShowTransferModal(false); setTransferUserId(''); setTransferReason(''); }} disabled={transferring}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => transferOwnership({ to_user_id: transferUserId, reason: transferReason || undefined })}
              disabled={transferring || !transferUserId.trim()}
              isLoading={transferring}
            >
              <Users className="h-4 w-4 mr-2" />
              Transfer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setApprovalNotes('');
        }}
        title="Request Approval"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Request approval for this object. Select the approval type and add any notes.
          </p>
          <div>
            <label className="block text-sm font-medium mb-2">Approval Type</label>
            <select
              value={approvalType}
              onChange={(e) => setApprovalType(e.target.value as ApprovalType)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="strategic">Strategic</option>
              <option value="operational">Operational</option>
            </select>
          </div>
          <Textarea
            label="Notes (optional)"
            placeholder="Add any additional notes for the approval request..."
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowApprovalModal(false);
                setApprovalNotes('');
              }}
              disabled={approving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmApproval}
              disabled={approving}
              isLoading={approving}
            >
              <Send className="h-4 w-4 mr-2" />
              Request Approval
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
