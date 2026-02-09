'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Avatar, Badge, Button, Input } from '@/components/ui';
import { useAuthGuard } from '@/hooks';
import { SUCCESS_MESSAGES } from '@/constants';
import { Mail, User, Calendar, Shield, Pencil, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { isReady } = useAuthGuard();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (!user) {
    return null;
  }

  const startEditing = () => {
    setFullName(user.full_name || '');
    setUsername(user.username || '');
    setEditError('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSave = async () => {
    setEditError('');
    setIsSaving(true);

    try {
      const response = await api.updateProfile({
        full_name: fullName.trim() || undefined,
        username: username.trim() || undefined,
      });

      if (response.success) {
        toast(SUCCESS_MESSAGES.PROFILE_UPDATED, 'success');
        await refreshUser();
        setIsEditing(false);
      } else {
        setEditError(response.detail || response.error || 'Failed to update profile.');
      }
    } catch {
      setEditError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Profile"
          description="Manage your account settings and preferences"
        />

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
              <div className="flex items-center justify-between">
                <CardTitle>Account Details</CardTitle>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Full Name */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <User className="h-5 w-5 text-[var(--muted-foreground)] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--muted-foreground)]">Full Name</p>
                    {isEditing ? (
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="mt-1"
                      />
                    ) : (
                      <p>{user.full_name || 'Not set'}</p>
                    )}
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <Mail className="h-5 w-5 text-[var(--muted-foreground)] flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>

                {/* Username */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <User className="h-5 w-5 text-[var(--muted-foreground)] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--muted-foreground)]">Username</p>
                    {isEditing ? (
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="mt-1"
                      />
                    ) : (
                      <p>{user.username || 'Not set'}</p>
                    )}
                  </div>
                </div>

                {/* Account Status (read-only) */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <Shield className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Account Status</p>
                    <p>{user.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                {/* User ID (read-only) */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--accent)]">
                  <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">User ID</p>
                    <p className="font-mono text-sm">{user.id}</p>
                  </div>
                </div>
              </div>

              {editError && (
                <p className="mt-4 text-sm text-[var(--error)]">{editError}</p>
              )}

              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                {isEditing ? (
                  <div className="flex gap-3">
                    <Button onClick={handleSave} isLoading={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={cancelEditing} disabled={isSaving}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={startEditing}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
      </div>
    </PageLayout>
  );
}
