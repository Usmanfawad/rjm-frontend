'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Sparkles, MessageSquare, FileText, Settings } from 'lucide-react';

const actions = [
  {
    href: '/campaigns/new',
    icon: Sparkles,
    label: 'New Campaign',
    description: 'Create persona program',
  },
  {
    href: '/chat',
    icon: MessageSquare,
    label: 'Chat with MIRA',
    description: 'Start conversation',
  },
  {
    href: '/settings/documents',
    icon: FileText,
    label: 'Documents',
    description: 'Manage documents',
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
    description: 'Configure account',
  },
];

export function QuickActions() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group p-4 rounded-xl border border-[var(--border)] hover:border-[var(--foreground)] hover:shadow-lg transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <action.icon className="h-5 w-5" />
              </div>
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{action.description}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
