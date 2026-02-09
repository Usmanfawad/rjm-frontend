'use client';

import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { createAppError, logError, getUserFriendlyMessage, type AppError } from '@/lib/errors';
import { useEffect, useState } from 'react';

interface ErrorMessageProps {
  error: unknown;
  context?: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({ error, context, onDismiss, className = '' }: ErrorMessageProps) {
  const [appError, setAppError] = useState<AppError | null>(null);

  useEffect(() => {
    if (error) {
      const err = createAppError(error, context);
      logError(err, context);
      setAppError(err);
    } else {
      setAppError(null);
    }
  }, [error, context]);

  if (!appError) return null;

  const userMessage = getUserFriendlyMessage(appError);

  return (
    <div
      className={`p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 flex items-start gap-3 ${className}`}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--error)]">Error</p>
        <p className="text-sm text-[var(--error)] mt-1">{userMessage}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="flex-shrink-0 text-[var(--error)] hover:opacity-80"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
