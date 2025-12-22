'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Navbar, Footer } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Sun, Moon, Bell, Shield, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--foreground)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Manage your application preferences.
            </p>
          </div>

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
                Choose your preferred theme for the application.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 transition-all',
                    theme === 'light'
                      ? 'border-[var(--foreground)] bg-[var(--accent)]'
                      : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                  )}
                >
                  <Sun className={cn(
                    'h-6 w-6 mx-auto mb-2',
                    theme === 'light' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                  )} />
                  <p className={cn(
                    'text-sm font-medium',
                    theme === 'light' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                  )}>
                    Light
                  </p>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 transition-all',
                    theme === 'dark'
                      ? 'border-[var(--foreground)] bg-[var(--accent)]'
                      : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                  )}
                >
                  <Moon className={cn(
                    'h-6 w-6 mx-auto mb-2',
                    theme === 'dark' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                  )} />
                  <p className={cn(
                    'text-sm font-medium',
                    theme === 'dark' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                  )}>
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
                    <div className="w-11 h-6 bg-[var(--accent)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--foreground)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[var(--border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--foreground)]"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Product Updates</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      News about new features and improvements
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-[var(--accent)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--foreground)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[var(--border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--foreground)]"></div>
                  </label>
                </div>
              </div>
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
              <div className="space-y-4">
                <Button variant="outline">Change Password</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card variant="bordered" className="border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <div className="flex gap-3">
                <Button variant="danger">Delete Account</Button>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
