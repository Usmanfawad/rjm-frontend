'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CampaignOverviewTab } from './CampaignOverviewTab';
import { PersonaFrameworkTab } from './PersonaFrameworkTab';
import { RefinementTab } from './RefinementTab';
import { ActionControlsTab } from './ActionControlsTab';
import type { CampaignView } from '@/types/api';

type TabKey = 'overview' | 'personas' | 'refinement' | 'activation';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'personas', label: 'Persona Framework' },
  { key: 'refinement', label: 'Refinement' },
  { key: 'activation', label: 'Activation' },
];

interface CampaignDetailProps {
  campaign: CampaignView;
  onRegister?: () => Promise<void>;
  onTransition?: (toState: string) => Promise<void>;
  onRegenerate?: () => Promise<void>;
  onDuplicate?: () => Promise<void>;
  onSaveDraft?: () => Promise<void>;
  onExport?: () => void;
}

export function CampaignDetail({
  campaign,
  onRegister,
  onTransition,
  onRegenerate,
  onDuplicate,
  onSaveDraft,
  onExport,
}: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{campaign.brand_name}</h1>
        {campaign.program_json?.header && (
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {campaign.program_json.header}
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-[var(--border)] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
              'border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-[var(--primary)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <CampaignOverviewTab campaign={campaign} />}
        {activeTab === 'personas' && <PersonaFrameworkTab campaign={campaign} />}
        {activeTab === 'refinement' && (
          <RefinementTab
            campaign={campaign}
            onRegenerate={onRegenerate}
            onDuplicate={onDuplicate}
            onSaveDraft={onSaveDraft}
          />
        )}
        {activeTab === 'activation' && (
          <ActionControlsTab
            campaign={campaign}
            onRegister={onRegister}
            onTransition={onTransition}
            onExport={onExport}
          />
        )}
      </div>
    </div>
  );
}
