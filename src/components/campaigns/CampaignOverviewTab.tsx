'use client';

import { useState } from 'react';
import { Calendar, FileText, Tag, CheckCircle, XCircle, AlertTriangle, Paperclip, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CampaignLifecycleBadge } from './CampaignLifecycleBadge';
import type { CampaignView, DocumentContextEntry } from '@/types/api';

interface CampaignOverviewTabProps {
  campaign: CampaignView;
}

const DOC_STATUS_CONFIG: Record<DocumentContextEntry['status'], {
  label: string;
  color: string;
  icon: typeof CheckCircle;
}> = {
  applied: { label: 'Context Applied', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  not_available: { label: 'Context Not Applied', color: 'text-yellow-600 dark:text-yellow-400', icon: AlertTriangle },
  error: { label: 'Context Error', color: 'text-red-600 dark:text-red-400', icon: XCircle },
};

export function CampaignOverviewTab({ campaign }: CampaignOverviewTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(campaign.program_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API failed silently
    }
  };

  const createdDate = new Date(campaign.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const docContext = campaign.program_json?._document_context;

  return (
    <div className="space-y-6">
      {/* Status & Metadata */}
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
            {campaign.governance_version && (
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-1">Version</p>
                <p className="text-sm flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  v{campaign.governance_version}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attached Documents */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-[var(--primary)]" />
            Attached Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {docContext && docContext.length > 0 ? (
            <div className="space-y-2">
              {docContext.map((doc) => {
                const cfg = DOC_STATUS_CONFIG[doc.status];
                const Icon = cfg.icon;
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                      <span className="text-sm truncate">
                        {doc.title || 'Untitled Document'}
                      </span>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              No documents were attached to this campaign during generation.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Brief */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Campaign Brief</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">
            {campaign.brief}
          </p>
        </CardContent>
      </Card>

      {/* Full Program Write-Up */}
      {campaign.program_text && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--primary)]" />
                Persona Program Write-Up
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
    </div>
  );
}
