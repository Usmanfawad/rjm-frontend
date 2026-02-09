'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { ChatSession } from '@/types/api';
import { cn } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/ui';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ChatHistorySidebarProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ChatHistorySidebar({
  currentSessionId,
  onSelectSession,
  onNewChat,
  isCollapsed = false,
  onToggleCollapse,
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await api.getChatSessions();
      if (response.success && response.data) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Refresh sessions when currentSessionId changes (new session created)
  useEffect(() => {
    if (currentSessionId) {
      fetchSessions();
    }
  }, [currentSessionId]);

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    setDeletingId(sessionToDelete);
    try {
      const response = await api.deleteChatSession(sessionToDelete);
      if (response.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
        if (currentSessionId === sessionToDelete) {
          onNewChat();
        }
        setSessionToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-[var(--muted)] border-r border-[var(--border)] flex flex-col items-center py-4 gap-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-[var(--accent)] transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
          title="New chat"
        >
          <Plus className="h-5 w-5" />
        </button>
        <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-2 px-1.5">
          {sessions.slice(0, 10).map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                currentSessionId === session.id
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'hover:bg-[var(--accent)]'
              )}
              title={session.title || 'Untitled chat'}
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-full bg-[var(--muted)] border-r border-[var(--border)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="font-semibold text-sm">Chat History</h2>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-[var(--accent)] transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity font-medium text-sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--muted-foreground)]">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  'group relative p-3 rounded-xl cursor-pointer transition-all',
                  currentSessionId === session.id
                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                    : 'hover:bg-[var(--background)]'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.title || 'Untitled chat'}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1.5">
                      <span>{session.message_count} messages</span>
                      <span>·</span>
                      <span>{formatRelativeTime(session.updated_at)}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, session.id)}
                    disabled={deletingId === session.id}
                    className={cn(
                      'p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity',
                      'hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                    )}
                    title="Delete conversation"
                  >
                    {deletingId === session.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={!!deletingId}
      />
    </div>
  );
}

