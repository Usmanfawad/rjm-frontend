'use client';

import { useRef, useState, useCallback } from 'react';
import { PageLayout, LoadingSpinner } from '@/components/layout';
import { ChatContainer, ChatHistorySidebar } from '@/components/chat';
import type { ChatContainerRef } from '@/components/chat/ChatContainer';
import { useAuthGuard } from '@/hooks';

export default function ChatPage() {
  const { isReady } = useAuthGuard();
  const chatRef = useRef<ChatContainerRef>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            />
          </div>
        </main>
      </div>
    </PageLayout>
  );
}
