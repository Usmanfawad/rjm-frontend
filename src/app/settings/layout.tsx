'use client';

import { PageLayout, PageHeader } from '@/components/layout';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function SettingsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Settings"
          description="Manage your account, organizations, and documents"
        />
        <SettingsLayout>{children}</SettingsLayout>
      </div>
    </PageLayout>
  );
}
