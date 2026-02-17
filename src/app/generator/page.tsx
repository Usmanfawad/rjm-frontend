'use client';

import { redirect } from 'next/navigation';

export default function GeneratorPage() {
  redirect('/campaigns/new');
}
