'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Calendar, FileText, Tag, CheckCircle, AlertTriangle, Copy, Check, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CampaignLifecycleBadge } from './CampaignLifecycleBadge';
import type { CampaignView } from '@/types/api';

interface CampaignOverviewTabProps {
  campaign: CampaignView;
}

export function CampaignOverviewTab({ campaign }: CampaignOverviewTabProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!campaign.program_text) return;
    try {
      await navigator.clipboard.writeText(campaign.program_text);
      setCopied(true);
      toast('Copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy. Try selecting the text manually.', 'error');
    }
  };

  const handleExportFramework = () => {
    const text = campaign.program_text;
    if (!text) return;
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
    if (!pj?.activation_summary) return;
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

  const createdDate = new Date(campaign.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const docContext = campaign.program_json?._document_context;
  const hasDocContext = docContext && docContext.length > 0;
  const pj = campaign.program_json;

  return (
    <div className="space-y-6">
      {/* Campaign Details */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-[var(--primary)]" />
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Status</p>
              <CampaignLifecycleBadge state={campaign.lifecycle_state} />
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Brand</p>
              <p className="text-sm font-medium">{campaign.brand_name}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Created</p>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {createdDate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brief */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
            Brief
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasDocContext ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Brief applied.
                </span>
              </div>
              {docContext.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-[var(--border)]"
                >
                  <p className="text-sm font-medium">{doc.title || 'Untitled Brief'}</p>
                  {doc.summary && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {doc.summary}
                    </p>
                  )}
                </div>
              ))}
              {/* Cultural signals detected */}
              {pj?.multicultural_expressions && pj.multicultural_expressions.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Multicultural Signals Detected</p>
                  <p className="text-sm">{pj.multicultural_expressions.join(', ')}</p>
                </div>
              )}
              {pj?.local_culture_segments && pj.local_culture_segments.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Local Signals Detected</p>
                  <p className="text-sm">{pj.local_culture_segments.join(', ')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--muted-foreground)]" />
              <span className="text-sm text-[var(--muted-foreground)]">
                No brief attached.
              </span>
            </div>
          )}
          {campaign.brief && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">
                {campaign.brief}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Write-Up */}
      {campaign.program_text && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--primary)]" />
                Campaign Write-Up
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap font-sans leading-relaxed">
              {campaign.program_text}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Activation Summary */}
      {pj?.activation_summary && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Activation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pj.activation_summary.primary_channels && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Primary Channels</p>
                  <p className="text-sm font-medium">
                    {Array.isArray(pj.activation_summary.primary_channels)
                      ? pj.activation_summary.primary_channels.join(', ')
                      : pj.activation_summary.primary_channels}
                  </p>
                </div>
              )}
              {pj.activation_summary.supporting_channels && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Supporting Channels</p>
                  <p className="text-sm font-medium">
                    {Array.isArray(pj.activation_summary.supporting_channels)
                      ? pj.activation_summary.supporting_channels.join(', ')
                      : pj.activation_summary.supporting_channels}
                  </p>
                </div>
              )}
              {pj.activation_summary.channel_weighting && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Channel Weighting</p>
                  <p className="text-sm font-medium">
                    {typeof pj.activation_summary.channel_weighting === 'object'
                      ? Object.entries(pj.activation_summary.channel_weighting).map(([k, v]) => `${k}: ${v}`).join(', ')
                      : pj.activation_summary.channel_weighting}
                  </p>
                </div>
              )}
              {pj.activation_summary.flighting_approach && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Flighting Approach</p>
                  <p className="text-sm font-medium">{pj.activation_summary.flighting_approach}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExportFramework}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Framework
        </button>
        {pj?.activation_summary && (
          <button
            onClick={handleExportActivation}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Activation Summary
          </button>
        )}
      </div>
    </div>
  );
}
