'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout';
import { ChatContainer, ChatHistorySidebar } from '@/components/chat';
import type { ChatContainerRef } from '@/components/chat/ChatContainer';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const chatRef = useRef<ChatContainerRef>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSelectSession = useCallback((sessionId: string) => {
    chatRef.current?.loadSession(sessionId);
  }, []);

  const handleNewChat = useCallback(() => {
    chatRef.current?.startNewChat();
  }, []);

  const handleSessionChange = useCallback((sessionId: string | null) => {
    setCurrentSessionId(sessionId);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--foreground)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
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
  );
}
