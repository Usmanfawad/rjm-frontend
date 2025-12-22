'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar, Footer } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Avatar, Badge, Button } from '@/components/ui';
import { Mail, User, Calendar, Shield, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Manage your account settings and preferences.
            </p>
          </div>

          {/* Profile Card */}
          <Card variant="elevated" className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar name={user.full_name || user.email} size="lg" />
                <div>
                  <h2 className="text-xl font-semibold">
                    {user.full_name || 'User'}
                  </h2>
                  <p className="text-[var(--muted-foreground)]">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {user.is_verified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Unverified</Badge>
                    )}
                    {user.is_active && <Badge variant="info">Active</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <User className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Full Name</p>
                    <p>{user.full_name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <Mail className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <User className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Username</p>
                    <p>{user.username || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <Shield className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Account Status</p>
                    <p>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">User ID</p>
                    <p className="font-mono text-sm">{user.id}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
