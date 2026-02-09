'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import type { ToastVariant } from '@/context/ToastContext';

const variantConfig: Record<ToastVariant, { icon: React.ElementType; bg: string; border: string; text: string }> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-[var(--success)]/10',
    border: 'border-[var(--success)]',
    text: 'text-[var(--success)]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-[var(--error)]/10',
    border: 'border-[var(--error)]',
    text: 'text-[var(--error)]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-[var(--warning)]/10',
    border: 'border-[var(--warning)]',
    text: 'text-[var(--warning)]',
  },
  info: {
    icon: Info,
    bg: 'bg-[var(--info)]/10',
    border: 'border-[var(--info)]',
    text: 'text-[var(--info)]',
  },
};

function ToastItem({ id, message, variant }: { id: string; message: string; variant: ToastVariant }) {
  const { removeToast } = useToastContext();
  const [isVisible, setIsVisible] = useState(false);
  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(id), 200);
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm
        ${config.bg} ${config.border}
        transition-all duration-200 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${config.text}`} />
      <p className="text-sm font-medium text-[var(--foreground)] flex-1">{message}</p>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded hover:bg-[var(--muted)] transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-[var(--muted-foreground)]" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
