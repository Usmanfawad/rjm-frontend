'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle, Button, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setSubmitted(true);
    } catch {
      // Always show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-[var(--primary)]">M</span>IRA
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[var(--success)]" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Check your email</h1>
              <p className="text-[var(--muted-foreground)]">
                If an account exists with <strong>{email}</strong>, we&apos;ve sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline mt-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Forgot your password?</h1>
                <p className="text-[var(--muted-foreground)]">
                  Enter the email address associated with your account and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[var(--error)]">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-[var(--muted-foreground)]">
        &copy; {new Date().getFullYear()} MIRA. All rights reserved.
      </footer>
    </div>
  );
}
