'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  message?: string;
}

/**
 * Reusable loading spinner component
 * Standardizes loading states across the app
 */
export function LoadingSpinner({
  size = 'md',
  className,
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-[var(--foreground)]', sizes[size])} />
      {message && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
