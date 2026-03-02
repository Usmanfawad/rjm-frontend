'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CampaignOverviewTab } from './CampaignOverviewTab';
import { PersonaFrameworkTab } from './PersonaFrameworkTab';
import { CustomizeTab } from './CustomizeTab';
import { ActionControlsTab } from './ActionControlsTab';
import type { CampaignView } from '@/types/api';

type TabKey = 'overview' | 'framework' | 'customize' | 'activation';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'framework', label: 'Framework' },
  { key: 'customize', label: 'Customize' },
  { key: 'activation', label: 'Activation' },
];

interface CampaignDetailProps {
  campaign: CampaignView;
  onActivate?: () => Promise<void>;
  onTransition?: (toState: string) => Promise<void>;
}

export function CampaignDetail({
  campaign,
  onActivate,
  onTransition,
}: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [scrollToEditing, setScrollToEditing] = useState(false);

  const handleSwitchToCustomize = () => {
    setScrollToEditing(true);
    setActiveTab('customize');
  };

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
            onClick={() => {
              setScrollToEditing(false);
              setActiveTab(tab.key);
            }}
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
        {activeTab === 'framework' && (
          <PersonaFrameworkTab
            campaign={campaign}
            onSwitchToCustomize={handleSwitchToCustomize}
          />
        )}
        {activeTab === 'customize' && (
          <CustomizeTab campaign={campaign} scrollToEditing={scrollToEditing} />
        )}
        {activeTab === 'activation' && (
          <ActionControlsTab
            campaign={campaign}
            onActivate={onActivate}
            onTransition={onTransition}
          />
        )}
      </div>
    </div>
  );
}
