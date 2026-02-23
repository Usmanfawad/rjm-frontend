'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hash,
  ArrowLeftRight,
  Globe,
  MapPin,
  Settings2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui';
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
}: RefinementTabProps) {
  const router = useRouter();
  const [personaCount, setPersonaCount] = useState<string>(
    campaign.program_json?.personas?.length?.toString() || '15',
  );
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isLocked =
    campaign.lifecycle_state === 'activated' ||
    campaign.lifecycle_state === 'archived';

  const handleRefineInChat = (instruction: string) => {
    const encoded = encodeURIComponent(instruction);
    router.push(
      `/chat?campaign_id=${campaign.id}&prefill=${encoded}`,
    );
  };

  const handleAdjustCount = () => {
    const count = parseInt(personaCount, 10);
    if (!count || count < 1 || count > 20) return;
    handleRefineInChat(
      `Rebuild this campaign with exactly ${count} personas. Recalculate portfolio, insights, activation plan, and cultural overlays.`,
    );
  };

  const handleReplacePersona = () => {
    if (!replaceFrom.trim()) return;
    const instruction = replaceTo.trim()
      ? `Replace the persona "${replaceFrom.trim()}" with "${replaceTo.trim()}" in this campaign. Recalculate insights and activation plan.`
      : `Remove the persona "${replaceFrom.trim()}" from this campaign. Recalculate insights and activation plan.`;
    handleRefineInChat(instruction);
  };

  const handleMulticulturalOverlay = () => {
    handleRefineInChat(
      'Apply multicultural overlay to this campaign. Detect cultural lineages from the brief and apply canonical multicultural expressions.',
    );
  };

  const handleLocalOverlay = () => {
    handleRefineInChat(
      'Apply local culture overlay to this campaign. Detect relevant DMAs from the brief and apply local culture segments.',
    );
  };

  const handleRebuildWithConstraints = () => {
    if (!constraints.trim()) return;
    handleRefineInChat(
      `Rebuild this campaign with the following constraints: ${constraints.trim()}`,
    );
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Refine Campaign</CardTitle>
        </CardHeader>
        <CardContent>
          {isLocked && (
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              This campaign is {campaign.lifecycle_state} and cannot be refined.
              Duplicate it to make changes.
            </p>
          )}

          <div className="space-y-6">
            {/* Adjust Persona Count */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Adjust Persona Count</p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={personaCount}
                  onChange={(e) => setPersonaCount(e.target.value)}
                  className="w-24"
                  disabled={isLocked}
                />
                <button
                  onClick={handleAdjustCount}
                  disabled={isLocked}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Replace Persona */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Replace Persona</p>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Persona to remove..."
                  value={replaceFrom}
                  onChange={(e) => setReplaceFrom(e.target.value)}
                  disabled={isLocked}
                />
                <Input
                  placeholder="Replace with (leave blank to just remove)..."
                  value={replaceTo}
                  onChange={(e) => setReplaceTo(e.target.value)}
                  disabled={isLocked}
                />
                <button
                  onClick={handleReplacePersona}
                  disabled={isLocked || !replaceFrom.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Apply Multicultural Overlay */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Apply Multicultural Overlay</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Detect and apply canonical multicultural expressions based on the campaign brief.
              </p>
              <button
                onClick={handleMulticulturalOverlay}
                disabled={isLocked}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Overlay
              </button>
            </div>

            {/* Apply Local Overlay */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Apply Local Overlay</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Detect and apply local DMA culture segments based on the campaign brief.
              </p>
              <button
                onClick={handleLocalOverlay}
                disabled={isLocked}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Overlay
              </button>
            </div>

            {/* Rebuild With Constraints */}
            <div className="p-4 rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-medium">Rebuild With Constraints</p>
              </div>
              <div className="space-y-2">
                <textarea
                  placeholder="Describe constraints for rebuilding (e.g., 'Only outdoor and adventure personas, no generic cross-category personas')..."
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  disabled={isLocked}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 resize-none"
                />
                <button
                  onClick={handleRebuildWithConstraints}
                  disabled={isLocked || !constraints.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rebuild
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
