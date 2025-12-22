'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  if (name) {
    return (
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-medium',
          'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
          sizes[size],
          className
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
        sizes[size],
        className
      )}
    >
      <User className="h-1/2 w-1/2" />
    </div>
  );
}
