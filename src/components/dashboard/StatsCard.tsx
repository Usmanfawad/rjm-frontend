'use client';

import { Card, CardContent } from '@/components/ui';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  link?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  link,
}: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-[var(--muted-foreground)]',
  };

  const content = (
    <Card variant="elevated" className={link ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className={cn('text-sm mt-1', changeColors[changeType])}>{change}</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--accent)]">
            <Icon className="h-6 w-6 text-[var(--foreground)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}
