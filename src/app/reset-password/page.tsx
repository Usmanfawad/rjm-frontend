'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle, Button, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-[var(--error)]/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-[var(--error)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Invalid reset link</h1>
        <p className="text-[var(--muted-foreground)]">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline mt-4"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.resetPassword({ token, new_password: password });
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.detail || response.error || 'Failed to reset password. The link may have expired.');
      }
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-[var(--success)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Password reset</h1>
        <p className="text-[var(--muted-foreground)]">
          Your password has been reset successfully. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Reset your password</h1>
        <p className="text-[var(--muted-foreground)]">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="pl-10"
              required
              minLength={8}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              className="pl-10"
              required
              minLength={8}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-[var(--error)]">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset password'}
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
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<div className="text-center text-[var(--muted-foreground)]">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-[var(--muted-foreground)]">
        &copy; {new Date().getFullYear()} MIRA. All rights reserved.
      </footer>
    </div>
  );
}
