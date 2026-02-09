'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please provide all required fields to create your account.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
    });

    if (result.success) {
      // Redirect to dashboard since user is now logged in
      router.push('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <Card variant="elevated" className="w-full max-w-md">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Create your account
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Start building persona programs for your campaigns
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] pointer-events-none" />
            <Input
              type="text"
              name="fullName"
              placeholder="Full name *"
              value={formData.fullName}
              onChange={handleChange}
              className="pl-10"
              autoComplete="name"
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] pointer-events-none" />
            <Input
              type="text"
              name="username"
              placeholder="Username (optional)"
              value={formData.username}
              onChange={handleChange}
              className="pl-10"
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] pointer-events-none" />
            <Input
              type="email"
              name="email"
              placeholder="Email address *"
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] pointer-events-none" />
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password * (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] pointer-events-none" />
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm password *"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pl-10 pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[var(--primary)] hover:opacity-80 font-medium transition-opacity"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
