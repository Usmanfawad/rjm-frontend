'use client';

import { useRouter } from 'next/navigation';
import { MessageSquare, RefreshCw, Copy, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { CampaignView } from '@/types/api';

interface RefinementTabProps {
  campaign: CampaignView;
  onRegenerate?: () => void;
  onDuplicate?: () => void;
  onSaveDraft?: () => void;
}

export function RefinementTab({
  campaign,
  onRegenerate,
  onDuplicate,
  onSaveDraft,
}: RefinementTabProps) {
  const router = useRouter();

  const openInChat = () => {
    router.push(`/chat?campaign_id=${campaign.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Refinement Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openInChat}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors text-left"
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
              onClick={onRegenerate}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium">Regenerate</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Fresh program
                </p>
              </div>
            </button>

            <button
              onClick={onDuplicate}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <Copy className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium">Duplicate</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Copy as new campaign
                </p>
              </div>
            </button>

            <button
              onClick={onSaveDraft}
              className="flex items-center gap-3 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--foreground)] hover:bg-[var(--accent)] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <Save className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm font-medium">Save Draft</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Save current state
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
