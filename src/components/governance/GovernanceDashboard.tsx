'use client';

import { Card, CardContent, CardHeader, CardTitle, StateBadge } from '@/components/ui';
import type { DashboardResponse } from '@/types/api';
import { FileText, CheckCircle, Clock, Play, Archive, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface GovernanceDashboardProps {
  dashboard: DashboardResponse;
}

export function GovernanceDashboard({ dashboard }: GovernanceDashboardProps) {
  const { stats, recent_objects, pending_approvals, my_objects } = dashboard;

  const statCards = [
    {
      title: 'Drafts',
      value: stats.draft_count,
      icon: FileText,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800',
    },
    {
      title: 'Approved',
      value: stats.approved_count,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Requested',
      value: stats.requested_count,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      title: 'In Progress',
      value: stats.in_progress_count,
      icon: Play,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Live',
      value: stats.live_count,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      title: 'Archived',
      value: stats.archived_count,
      icon: Archive,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Approvals */}
      {pending_approvals.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Pending Approvals ({pending_approvals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pending_approvals.map((obj) => (
                <Link
                  key={obj.id}
                  href={`/governance/${obj.id}`}
                  className="block p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{obj.title || 'Untitled'}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {obj.object_type.replace(/_/g, ' ')} • v{obj.version}
                      </p>
                    </div>
                    <StateBadge state={obj.current_state} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Objects */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Recent Objects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent_objects.length > 0 ? (
                recent_objects.map((obj) => (
                  <Link
                    key={obj.id}
                    href={`/governance/${obj.id}`}
                    className="block p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{obj.title || 'Untitled'}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {new Date(obj.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StateBadge state={obj.current_state} />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  No recent objects
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>My Objects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {my_objects.length > 0 ? (
                my_objects.map((obj) => (
                  <Link
                    key={obj.id}
                    href={`/governance/${obj.id}`}
                    className="block p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{obj.title || 'Untitled'}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {new Date(obj.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StateBadge state={obj.current_state} />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  No objects assigned to you
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
