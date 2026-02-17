'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Building2, FileText } from 'lucide-react';
import { ROUTES } from '@/constants';

const SETTINGS_TABS = [
  { href: ROUTES.SETTINGS_ACCOUNT, label: 'Account', icon: User },
  { href: ROUTES.SETTINGS_ORGANIZATIONS, label: 'Organizations', icon: Building2 },
  { href: ROUTES.SETTINGS_DOCUMENTS, label: 'Documents', icon: FileText },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <nav className="md:w-56 shrink-0">
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {SETTINGS_TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
