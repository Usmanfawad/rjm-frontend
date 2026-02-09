'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string | ReactNode;
  description?: string;
  action?: ReactNode;
  showBack?: boolean;
  backHref?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Standardized page header component
 * Provides consistent page headers across the app
 */
export function PageHeader({
  title,
  description,
  action,
  showBack = false,
  backHref,
  className = '',
  children,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      {showBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}
      {children}
      <div className="flex items-center justify-between">
        <div>
          {typeof title === 'string' ? (
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
          ) : (
            <div className="mb-2">{title}</div>
          )}
          {description && (
            <p className="text-[var(--muted-foreground)]">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
