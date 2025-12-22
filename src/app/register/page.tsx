'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth';
import { ThemeToggle } from '@/components/ui';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-[var(--primary)]">M</span>IRA
        </Link>
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <RegisterForm />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-[var(--muted-foreground)]">
        &copy; {new Date().getFullYear()} MIRA. All rights reserved.
      </footer>
    </div>
  );
}
