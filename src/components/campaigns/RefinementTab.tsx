'use client';

import { useState } from 'react';
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
import { api } from '@/lib/api';
import type { CampaignView } from '@/types/api';

interface RefinementTabProps {
  campaign: CampaignView;
  onRegenerate?: () => Promise<void>;
  onDuplicate?: () => Promise<void>;
  onSaveDraft?: () => Promise<void>;
}

export function RefinementTab({
  campaign,
}: RefinementTabProps) {
  const [personaCount, setPersonaCount] = useState<string>(
    campaign.program_json?.personas?.length?.toString() || '15',
  );
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');
  const [constraints, setConstraints] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

  const isLocked =
    campaign.lifecycle_state === 'live' ||
    campaign.lifecycle_state === 'archived';

  const handleAdjustCount = async () => {
    const count = parseInt(personaCount, 10);
    if (!count || count < 1 || count > 20) {
      setError('Persona count must be between 1 and 20.');
      return;
    }
    setApplying(true);
    setError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        persona_count: count,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setError('Rebuild failed. Please try again.');
      }
    } catch {
      setError('Rebuild failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleReplacePersona = async () => {
    if (!replaceFrom.trim()) return;
    setApplying(true);
    setError('');
    try {
      const currentNames = campaign.program_json?.personas?.map((p) => p.name) || [];
      const removed = [replaceFrom.trim()];
      const requested = replaceTo.trim()
        ? currentNames.filter((n) => n !== replaceFrom.trim()).concat(replaceTo.trim())
        : currentNames.filter((n) => n !== replaceFrom.trim());

      const res = await api.rebuildGeneration(campaign.id, {
        requested_personas: requested,
        removed_personas: removed,
        persona_count: requested.length,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setError('Rebuild failed. Please try again.');
      }
    } catch {
      setError('Rebuild failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleMulticulturalOverlay = async () => {
    setApplying(true);
    setError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        apply_multicultural_overlay: true,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setError('Overlay application failed. Please try again.');
      }
    } catch {
      setError('Overlay application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleLocalOverlay = async () => {
    setApplying(true);
    setError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        apply_local_overlay: true,
      });
      if (res.success) {
        window.location.reload();
      } else {
        setError('Overlay application failed. Please try again.');
      }
    } catch {
      setError('Overlay application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleRebuildWithConstraints = async () => {
    if (!constraints.trim()) return;
    setApplying(true);
    setError('');
    try {
      const res = await api.rebuildGeneration(campaign.id, {
        constraints: constraints.trim(),
      });
      if (res.success) {
        window.location.reload();
      } else {
        setError('Rebuild failed. Please try again.');
      }
    } catch {
      setError('Rebuild failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLocked && (
        <div className="p-4 rounded-lg border border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/10">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This campaign is {campaign.lifecycle_state} and cannot be refined.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-400/30 bg-red-50 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Refine Campaign</CardTitle>
        </CardHeader>
        <CardContent>
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
                  disabled={isLocked || applying}
                />
                <button
                  onClick={handleAdjustCount}
                  disabled={isLocked || applying}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Rebuilding...' : 'Apply'}
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
                  disabled={isLocked || applying}
                />
                <Input
                  placeholder="Replace with (leave blank to just remove)..."
                  value={replaceTo}
                  onChange={(e) => setReplaceTo(e.target.value)}
                  disabled={isLocked || applying}
                />
                <button
                  onClick={handleReplacePersona}
                  disabled={isLocked || !replaceFrom.trim() || applying}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Rebuilding...' : 'Apply'}
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
                disabled={isLocked || applying}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Applying...' : 'Apply Overlay'}
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
                disabled={isLocked || applying}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Applying...' : 'Apply Overlay'}
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
                  disabled={isLocked || applying}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 resize-none"
                />
                <button
                  onClick={handleRebuildWithConstraints}
                  disabled={isLocked || !constraints.trim() || applying}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Rebuilding...' : 'Rebuild'}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
