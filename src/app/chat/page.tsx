'use client';

import { useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageLayout, LoadingSpinner } from '@/components/layout';
import { ChatContainer, ChatHistorySidebar } from '@/components/chat';
import type { ChatContainerRef, CampaignContext } from '@/components/chat/ChatContainer';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { Sparkles, X } from 'lucide-react';

export default function ChatPage() {
  const { isReady } = useAuthGuard();
  const chatRef = useRef<ChatContainerRef>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaign_id');
  const [showCampaignBanner, setShowCampaignBanner] = useState(!!campaignId);

  // Fetch campaign data if campaign_id is present
  const { data: generations } = useApiQuery(
    () => api.getPersonaGenerations(100, 0),
    { enabled: isReady && !!campaignId },
  );

  const linkedCampaign = campaignId && generations?.generations
    ? generations.generations.find((g) => g.id === campaignId)
    : null;

  // Build campaign context for ChatContainer
  const campaignContext: CampaignContext | null = linkedCampaign
    ? {
        brand_name: linkedCampaign.brand_name,
        brief: linkedCampaign.brief,
      }
    : null;

  const handleSelectSession = useCallback((sessionId: string) => {
    chatRef.current?.loadSession(sessionId);
  }, []);

  const handleNewChat = useCallback(() => {
    chatRef.current?.startNewChat();
  }, []);

  const handleSessionChange = useCallback((sessionId: string | null) => {
    setCurrentSessionId(sessionId);
  }, []);

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading chat..." />;
  }

  return (
    <PageLayout showFooter={false}>
      <div className="h-screen flex flex-col">
        {/* Campaign Context Banner */}
        {showCampaignBanner && linkedCampaign && (
          <div className="flex items-center justify-between px-4 py-2 bg-[var(--accent)] border-b border-[var(--border)]">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              <span className="font-medium">Refining:</span>
              <span className="text-[var(--muted-foreground)]">
                {linkedCampaign.brand_name}
              </span>
            </div>
            <button
              onClick={() => setShowCampaignBanner(false)}
              className="p-1 hover:bg-[var(--border)] rounded transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-hidden flex">
          {/* Chat History Sidebar */}
          <ChatHistorySidebar
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Chat Container */}
          <div className="flex-1 h-full bg-[var(--background)]">
            <ChatContainer
              ref={chatRef}
              onSessionChange={handleSessionChange}
              campaignContext={showCampaignBanner ? campaignContext : null}
            />
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
