'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="text-sm prose prose-sm dark:prose-invert max-w-none 
            prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2 prose-headings:text-inherit
            prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
            prose-p:my-2 prose-p:leading-relaxed
            prose-ul:my-2 prose-ul:pl-4 prose-li:my-0.5
            prose-ol:my-2 prose-ol:pl-4
            prose-strong:font-semibold prose-strong:text-inherit
            prose-a:text-[var(--info)] prose-a:no-underline hover:prose-a:underline
            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
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
