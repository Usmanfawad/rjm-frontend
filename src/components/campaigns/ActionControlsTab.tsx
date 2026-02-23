'use client';

import { useState } from 'react';
import {
  Send,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Download,
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
      {/* Header */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Launch Persona Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Move from strategy to live execution.
          </p>
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

      {/* Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Submit for Activation */}
            {!isGoverned && (
              <button
                onClick={handleRegister}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-dashed border-[var(--primary)]/40 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[var(--primary)]" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Submit for Activation</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Register and begin the activation lifecycle
                    </p>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            )}

            {/* Progress through lifecycle if governed */}
            {isGoverned && (state === 'ideation' || state === 'draft') && (
              <button
                onClick={() => handleTransition('approved')}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-green-400 hover:bg-green-500/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-green-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Submit for Activation</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Move to approval workflow
                    </p>
                  </div>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            )}

            {state === 'review' && (
              <button
                onClick={() => handleTransition('requested_for_activation')}
                disabled={transitioning}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-green-400 hover:bg-green-500/5 transition-colors disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-green-500" />
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

            {/* Export Persona Framework */}
            <button
              onClick={handleCopyText}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              <span className="flex items-center gap-3">
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Download className="h-5 w-5 text-[var(--muted-foreground)]" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {copied ? 'Copied' : 'Export Persona Framework'}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Copy full program text to clipboard
                  </p>
                </div>
              </span>
            </button>

            {/* Duplicate Campaign */}
            <button
              onClick={onExport}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              <span className="flex items-center gap-3">
                <Copy className="h-5 w-5 text-[var(--muted-foreground)]" />
                <div className="text-left">
                  <p className="text-sm font-medium">Duplicate Campaign</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Copy as new campaign
                  </p>
                </div>
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
