'use client';

import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';

// Redirect to the existing org detail page (preserves full functionality)
export default function SettingsOrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  redirect(`/organizations/${id}`);
}
