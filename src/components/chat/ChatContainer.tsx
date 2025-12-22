'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { api } from '@/lib/api';
import type { ChatMessage as ChatMessageType } from '@/types/api';
import { Bot } from 'lucide-react';

export function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessageType = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await api.chat({
        messages: [...messages, userMessage],
        state,
        session_id: sessionId,
      });

      if (response.success && response.data) {
        const assistantMessage: ChatMessageType = {
          role: 'assistant',
          content: response.data.reply,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setState(response.data.state);
        setSessionId(response.data.session_id);
      } else {
        const errorMessage: ChatMessageType = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessageType = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--foreground)] flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-[var(--background)]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Chat with MIRA
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-md">
              I&apos;m your AI cultural intelligence assistant. Tell me about your brand and campaign
              goals, and I&apos;ll help you create powerful persona programs.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              role={msg.role as 'user' | 'assistant'}
              content={msg.content}
            />
          ))
        )}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-full bg-[var(--foreground)] flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-[var(--background)]" />
            </div>
            <div className="bg-[var(--accent)] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)]">
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          placeholder="Tell me about your brand and campaign..."
        />
      </div>
    </div>
  );
}
