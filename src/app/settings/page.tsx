'use client';

import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

export default function SettingsPage() {
  redirect(ROUTES.SETTINGS_ACCOUNT);
}
