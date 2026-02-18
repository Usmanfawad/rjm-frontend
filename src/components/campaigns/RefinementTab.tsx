'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, RefreshCw, Copy, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { CampaignView } from '@/types/api';

interface RefinementTabProps {
  campaign: CampaignView;
  onRegenerate?: () => Promise<void>;
  onDuplicate?: () => Promise<void>;
  onSaveDraft?: () => Promise<void>;
}

export function RefinementTab({
  campaign,
  onRegenerate,
  onDuplicate,
  onSaveDraft,
}: RefinementTabProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const openInChat = () => {
    router.push(`/chat?campaign_id=${campaign.id}`);
  };

  const handleAction = async (action: string, fn?: () => Promise<void>) => {
    if (!fn || loadingAction) return;
    setLoadingAction(action);
    try {
      await fn();
    } finally {
      setLoadingAction(null);
    }
  };

  const isLocked = campaign.lifecycle_state === 'activated' || campaign.lifecycle_state === 'archived';

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Refinement Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLocked && (
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              This campaign is {campaign.lifecycle_state} and cannot be modified. You can still duplicate it.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openInChat}
              disabled={!!loadingAction}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium">Open in Chat</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Refine with MIRA
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAction('regenerate', onRegenerate)}
              disabled={!!loadingAction || isLocked}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                {loadingAction === 'regenerate' ? (
                  <Loader2 className="h-5 w-5 text-[var(--primary)] animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5 text-[var(--primary)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {loadingAction === 'regenerate' ? 'Regenerating...' : 'Regenerate'}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Fresh program, same brief
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAction('duplicate', onDuplicate)}
              disabled={!!loadingAction}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                {loadingAction === 'duplicate' ? (
                  <Loader2 className="h-5 w-5 text-[var(--primary)] animate-spin" />
                ) : (
                  <Copy className="h-5 w-5 text-[var(--primary)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {loadingAction === 'duplicate' ? 'Duplicating...' : 'Duplicate'}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Copy as new campaign
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAction('save', onSaveDraft)}
              disabled={!!loadingAction || isLocked || !!campaign.governance_id}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                {loadingAction === 'save' ? (
                  <Loader2 className="h-5 w-5 text-[var(--primary)] animate-spin" />
                ) : (
                  <Save className="h-5 w-5 text-[var(--primary)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {campaign.governance_id ? 'Draft Saved' : loadingAction === 'save' ? 'Saving...' : 'Save Draft'}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {campaign.governance_id ? 'Registered for activation' : 'Register as draft'}
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Formatted Program Text */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Program Text</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap font-sans leading-relaxed">
            {campaign.program_text}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
