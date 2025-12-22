'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-4', isUser ? 'flex-row-reverse' : '')}>
      <div
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-[var(--foreground)]'
            : 'bg-[var(--foreground)]'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-[var(--background)]" />
        ) : (
          <Bot className="h-5 w-5 text-[var(--background)]" />
        )}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-[var(--foreground)] text-[var(--background)] rounded-br-sm'
            : 'bg-[var(--accent)] rounded-bl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p
            className={cn(
              'text-xs mt-1',
              isUser ? 'opacity-70' : 'text-[var(--muted-foreground)]'
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
