'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui';
import { VoiceRecorder } from './VoiceRecorder';
import { Send, Loader2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = 'Describe a brand, objective, or campaign direction...' }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceTranscription = (transcribedText: string) => {
    onSend(transcribedText);
    setIsVoiceMode(false);
  };

  const handleVoiceCancel = () => {
    setIsVoiceMode(false);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Voice recording mode
  if (isVoiceMode) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
        <VoiceRecorder
          onTranscriptionComplete={handleVoiceTranscription}
          onCancel={handleVoiceCancel}
          isDisabled={isLoading}
        />
      </div>
    );
  }

  // Normal text input mode
  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
        {/* Voice recording button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsVoiceMode(true)}
          disabled={isLoading}
          className={cn(
            'rounded-xl p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400',
            'transition-colors duration-200'
          )}
          title="Record voice message"
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm"
        />

        {/* Send button */}
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || isLoading}
          className="rounded-xl"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Hint text */}
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
        Press Enter to send or click <Mic className="h-3 w-3 inline mx-0.5" /> to record a voice message
      </p>
    </form>
  );
}
