'use client';

import { redirect } from 'next/navigation';

// Redirect to the original create org page (still functional)
export default function SettingsOrganizationsNewPage() {
  redirect('/organizations/new');
}
