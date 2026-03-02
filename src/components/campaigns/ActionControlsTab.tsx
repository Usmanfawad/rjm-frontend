'use client';

import { useState } from 'react';
import {
  Send,
  Download,
  Radio,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CampaignLifecycleBadge } from './CampaignLifecycleBadge';
import { useToast } from '@/hooks/useToast';
import type { CampaignView } from '@/types/api';

interface ActionControlsTabProps {
  campaign: CampaignView;
  onActivate?: () => Promise<void>;
  onTransition?: (toState: string) => Promise<void>;
}

export function ActionControlsTab({
  campaign,
  onActivate,
  onTransition,
}: ActionControlsTabProps) {
  const { toast } = useToast();
  const [transitioning, setTransitioning] = useState(false);
  const [executionPath, setExecutionPath] = useState<'managed' | 'programmatic' | null>(null);
  const state = campaign.lifecycle_state;

  const handleActivate = async () => {
    if (transitioning) return;
    setTransitioning(true);
    try {
      if (onActivate) {
        await onActivate();
      }
    } finally {
      setTransitioning(false);
    }
  };

  const handleExportFramework = () => {
    const text = campaign.program_text;
    if (!text) {
      toast('No framework data to export.', 'error');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.brand_name}-framework.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportActivation = () => {
    const pj = campaign.program_json;
    if (!pj?.activation_summary) {
      toast('No activation summary available to export.', 'error');
      return;
    }
    const summary = pj.activation_summary;
    let text = 'ACTIVATION SUMMARY\n\n';
    if (summary.primary_channels) text += `Primary Channels: ${Array.isArray(summary.primary_channels) ? summary.primary_channels.join(', ') : summary.primary_channels}\n`;
    if (summary.supporting_channels) text += `Supporting Channels: ${Array.isArray(summary.supporting_channels) ? summary.supporting_channels.join(', ') : summary.supporting_channels}\n`;
    if (summary.channel_weighting) text += `Channel Weighting: ${typeof summary.channel_weighting === 'object' ? JSON.stringify(summary.channel_weighting) : summary.channel_weighting}\n`;
    if (summary.flighting_approach) text += `Flighting Approach: ${summary.flighting_approach}\n`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaign.brand_name}-activation-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Launch Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <CampaignLifecycleBadge state={state} />
          </div>
        </CardContent>
      </Card>

      {/* Status-dependent content */}
      {state === 'proposal' && (
        <>
          {/* Execution Path */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Execution Path</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button
                  onClick={() => setExecutionPath('managed')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    executionPath === 'managed'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-[var(--primary)]" />
                    <div>
                      <p className="text-sm font-medium">Managed Execution (IO)</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Run this campaign directly through Real Juice Media.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setExecutionPath('programmatic')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    executionPath === 'programmatic'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Radio className="h-5 w-5 text-[var(--primary)]" />
                    <div>
                      <p className="text-sm font-medium">Programmatic Deal ID</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Receive a PMP Deal ID for activation in your DSP.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={transitioning || !executionPath}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {transitioning ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-5 w-5" />
                Activate Campaign
              </>
            )}
          </button>
        </>
      )}

      {state === 'activation_requested' && (
        <Card variant="elevated">
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Activation Requested</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Your campaign has been submitted for activation.
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              A Deal ID or IO confirmation will be issued within 24 hours.
            </p>
          </CardContent>
        </Card>
      )}

      {state === 'live' && (
        <Card variant="elevated">
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              Campaign is Live
            </h3>
          </CardContent>
        </Card>
      )}

      {state === 'archived' && (
        <Card variant="elevated">
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold text-[var(--muted-foreground)]">
              Campaign Archived
            </h3>
          </CardContent>
        </Card>
      )}

      {/* Export Buttons */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <button
              onClick={handleExportFramework}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              <Download className="h-5 w-5 text-[var(--muted-foreground)]" />
              <div className="text-left">
                <p className="text-sm font-medium">Export Framework</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Download full persona framework as text
                </p>
              </div>
            </button>

            <button
              onClick={handleExportActivation}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              <Download className="h-5 w-5 text-[var(--muted-foreground)]" />
              <div className="text-left">
                <p className="text-sm font-medium">Export Activation Summary</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Download activation summary as text
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
