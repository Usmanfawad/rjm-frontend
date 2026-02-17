'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Send,
  Archive,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CampaignLifecycleBadge } from './CampaignLifecycleBadge';
import type { CampaignView } from '@/types/api';

interface ActionControlsTabProps {
  campaign: CampaignView;
  onRegister?: () => Promise<void>;
  onTransition?: (toState: string) => Promise<void>;
  onExport?: () => void;
}

export function ActionControlsTab({
  campaign,
  onRegister,
  onTransition,
  onExport,
}: ActionControlsTabProps) {
  const [copied, setCopied] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const state = campaign.lifecycle_state;
  const isGoverned = !!campaign.governance_id;

  const handleRegister = async () => {
    if (!onRegister || transitioning) return;
    setTransitioning(true);
    try {
      await onRegister();
    } finally {
      setTransitioning(false);
    }
  };

  const handleTransition = async (toState: string) => {
    if (!onTransition || transitioning) return;
    setTransitioning(true);
    try {
      await onTransition(toState);
    } finally {
      setTransitioning(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(campaign.program_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API failed silently
    }
  };

  return (
    <div className="space-y-6">
      {/* Current State */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Campaign State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <CampaignLifecycleBadge state={state} />
            {campaign.governance_id && (
              <span className="text-xs text-[var(--muted-foreground)]">
                Governed
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Step 0: Register — only when not yet governed */}
            {!isGoverned && (
              <button
                onClick={handleRegister}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-dashed border-[var(--primary)]/40 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[var(--primary)]" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Register Campaign</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Start the activation lifecycle
                    </p>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            )}

            {/* Step 1: Draft → Approved (Submit for Review) */}
            {isGoverned && (state === 'ideation' || state === 'draft') && (
              <button
                onClick={() => handleTransition('approved')}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-green-400 hover:bg-green-500/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Submit for Review</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Move to approval workflow
                    </p>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            )}

            {/* Step 2: Approved → Requested for Activation (Finalize) */}
            {state === 'review' && (
              <button
                onClick={() => handleTransition('requested_for_activation')}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-green-400 hover:bg-green-500/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Finalize</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Approve and prepare for activation
                    </p>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            )}

            {/* Step 3: Requested → In Progress (Send to Activation) */}
            {state === 'finalized' && (
              <button
                onClick={() => handleTransition('in_progress')}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-emerald-400 hover:bg-emerald-500/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-emerald-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Send to Activation</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Begin campaign activation
                    </p>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            )}

            {/* Step 4: In Progress → Live (Go Live) */}
            {state === 'activated' && (
              <button
                onClick={() => handleTransition('live')}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-emerald-400 hover:bg-emerald-500/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-emerald-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Go Live</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Mark campaign as live in market
                    </p>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            )}

            {/* Archive — available on all governed non-archived states */}
            {isGoverned && state !== 'archived' && (
              <button
                onClick={() => handleTransition('archived')}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-red-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Archive</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Archive this campaign
                    </p>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors text-sm"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy Program Text'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
