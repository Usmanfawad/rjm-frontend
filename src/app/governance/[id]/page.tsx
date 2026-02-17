'use client';

import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function GovernanceObjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  redirect(`/activation/${id}`);
}
