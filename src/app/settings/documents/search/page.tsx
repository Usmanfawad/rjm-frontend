'use client';

import { redirect } from 'next/navigation';

// Redirect to the original documents search page
export default function SettingsDocumentsSearchPage() {
  redirect('/documents/search');
}
