'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal } from '@/components/ui';
import { useAuthGuard } from '@/hooks';
import { ROUTES, SUCCESS_MESSAGES } from '@/constants';
import { Sun, Moon, Bell, Shield, Trash2, Lock, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { UsageStatsResponse } from '@/types/api';

export default function AccountSettingsPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const { isReady } = useAuthGuard();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState('');

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [usageStats, setUsageStats] = useState<UsageStatsResponse | null>(null);
  const [usagePeriod, setUsagePeriod] = useState<string>('today');
  const [usageLoading, setUsageLoading] = useState(false);

  const fetchUsageStats = useCallback(async (period: string) => {
    setUsageLoading(true);
    try {
      const response = await api.getUsageStats(period);
      if (response.success && response.data) {
        setUsageStats(response.data);
      }
    } catch {
      // Silently fail
    } finally {
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReady) fetchUsageStats(usagePeriod);
  }, [isReady, usagePeriod, fetchUsageStats]);

  if (!isReady) {
    return <LoadingSpinner message="Loading account settings..." />;
  }

  const handleLogout = () => {
    logout();
    router.push(ROUTES.HOME);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    if (newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('Passwords do not match.');
      return;
    }
    setChangePasswordLoading(true);
    try {
      const response = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (response.success) {
        toast(SUCCESS_MESSAGES.PASSWORD_CHANGED, 'success');
        setShowChangePassword(false);
        resetChangePasswordForm();
      } else {
        setChangePasswordError(response.detail || response.error || 'Failed to change password.');
      }
    } catch {
      setChangePasswordError('Failed to change password. Please try again.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const resetChangePasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangePasswordError('');
    setShowCurrentPw(false);
    setShowNewPw(false);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      const response = await api.deleteAccount(deletePassword);
      if (response.success) {
        toast(SUCCESS_MESSAGES.ACCOUNT_DELETED, 'success');
        logout();
        router.push(ROUTES.HOME);
      } else {
        setDeleteError(response.detail || response.error || 'Failed to delete account.');
      }
    } catch {
      setDeleteError('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* Appearance */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Choose your preferred theme.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 transition-all',
                theme === 'light'
                  ? 'border-[var(--foreground)] bg-[var(--accent)]'
                  : 'border-[var(--border)] hover:border-[var(--muted-foreground)]',
              )}
            >
              <Sun
                className={cn(
                  'h-6 w-6 mx-auto mb-2',
                  theme === 'light' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]',
                )}
              />
              <p
                className={cn(
                  'text-sm font-medium',
                  theme === 'light' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]',
                )}
              >
                Light
              </p>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex-1 p-4 rounded-xl border-2 transition-all',
                theme === 'dark'
                  ? 'border-[var(--foreground)] bg-[var(--accent)]'
                  : 'border-[var(--border)] hover:border-[var(--muted-foreground)]',
              )}
            >
              <Moon
                className={cn(
                  'h-6 w-6 mx-auto mb-2',
                  theme === 'dark' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]',
                )}
              />
              <p
                className={cn(
                  'text-sm font-medium',
                  theme === 'dark' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]',
                )}
              >
                Dark
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Receive updates about your generated programs
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-[var(--accent)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--foreground)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[var(--border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--foreground)]" />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setUsagePeriod(period)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                  usagePeriod === period
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : 'bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                )}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          {usageLoading ? (
            <LoadingSpinner message="Loading usage data..." />
          ) : usageStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-[var(--accent)]">
                  <p className="text-xs text-[var(--muted-foreground)]">Generations</p>
                  <p className="text-xl font-bold">{usageStats.total_generations}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {usageStats.generations_remaining_today} remaining today
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--accent)]">
                  <p className="text-xs text-[var(--muted-foreground)]">Chat Messages</p>
                  <p className="text-xl font-bold">{usageStats.total_chat_messages}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    of {usageStats.rate_limit.max_chat_messages_per_day}/day
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--accent)]">
                  <p className="text-xs text-[var(--muted-foreground)]">Total Requests</p>
                  <p className="text-xl font-bold">{usageStats.total_requests}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {usageStats.requests_remaining_today} remaining today
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                <span>Tokens used: {usageStats.total_tokens_used.toLocaleString()}</span>
                <span>Tier: {usageStats.rate_limit.tier}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">Usage data unavailable.</p>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setShowChangePassword(true)}>
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="border-[var(--error)]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--error)]">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Once you delete your account, there is no going back.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={() => setShowDeleteAccount(true)}>
              Delete Account
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => {
          setShowChangePassword(false);
          resetChangePasswordForm();
        }}
        title="Change Password"
        size="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="pl-10"
                required
                minLength={8}
              />
            </div>
          </div>
          {changePasswordError && <p className="text-sm text-[var(--error)]">{changePasswordError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowChangePassword(false);
                resetChangePasswordForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={changePasswordLoading}>
              {changePasswordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteAccount}
        onClose={() => {
          setShowDeleteAccount(false);
          setDeletePassword('');
          setDeleteError('');
        }}
        title="Delete Account"
        size="sm"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            This action cannot be undone. Please enter your password to confirm.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10"
                required
              />
            </div>
          </div>
          {deleteError && <p className="text-sm text-[var(--error)]">{deleteError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteAccount(false);
                setDeletePassword('');
                setDeleteError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
