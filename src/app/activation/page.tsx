'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Legacy activation pipeline page — removed per directive.
 * Lifecycle control now lives only inside campaign detail.
 * Redirects to campaigns list.
 */
export default function ActivationPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/campaigns');
  }, [router]);

  return null;
}
