'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageLayout, LoadingSpinner } from '@/components/layout';
import { StatsCard, RecentActivity, QuickActions } from '@/components/dashboard';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { Sparkles, MessageSquare, CheckCircle, Zap, Shield } from 'lucide-react';

export default function WorkspacePage() {
  const { user } = useAuth();
  const { isReady } = useAuthGuard();

  const { data: generations } = useApiQuery(
    () => api.getPersonaGenerations(50, 0),
    { enabled: isReady },
  );
  const { data: sessions } = useApiQuery(
    () => api.getChatSessions(),
    { enabled: isReady },
  );
  const { data: governance } = useApiQuery(
    () => api.getDashboardStats(),
    { enabled: isReady },
  );

  const stats = useMemo(
    () => ({
      campaigns: generations?.total || 0,
      sessions: sessions?.total || 0,
      inReview: governance?.approved_count || 0,
      readyForActivation: governance?.requested_count || 0,
      live: governance?.live_count || 0,
    }),
    [generations, sessions, governance],
  );

  const statsCards = useMemo(
    () => [
      {
        title: 'Active Campaigns',
        value: stats.campaigns.toString(),
        change: 'Total programs',
        changeType: 'neutral' as const,
        icon: Sparkles,
        link: ROUTES.CAMPAIGNS,
      },
      {
        title: 'In Review',
        value: stats.inReview.toString(),
        change: 'Awaiting approval',
        changeType: 'neutral' as const,
        icon: CheckCircle,
        link: ROUTES.ACTIVATION,
      },
      {
        title: 'Ready for Activation',
        value: stats.readyForActivation.toString(),
        change: 'Finalized programs',
        changeType: 'positive' as const,
        icon: Zap,
        link: ROUTES.ACTIVATION,
      },
      {
        title: 'Live',
        value: stats.live.toString(),
        change: 'In market now',
        changeType: 'positive' as const,
        icon: Shield,
        link: ROUTES.ACTIVATION,
      },
      {
        title: 'Chat Sessions',
        value: stats.sessions.toString(),
        change: 'MIRA conversations',
        changeType: 'neutral' as const,
        icon: MessageSquare,
        link: ROUTES.CHAT,
      },
    ],
    [stats],
  );

  const formatTimestamp = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const activities = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'generation' | 'chat' | 'document';
      title: string;
      description: string;
      timestamp: string;
      sortDate: Date;
    }> = [];

    if (generations?.generations) {
      generations.generations.slice(0, 3).forEach((gen) => {
        list.push({
          id: `gen-${gen.id}`,
          type: 'generation',
          title: gen.program_json?.header || gen.brand_name || 'Campaign',
          description: `Campaign for ${gen.brand_name || 'brand'}`,
          timestamp: gen.created_at ? formatTimestamp(gen.created_at) : 'Recently',
          sortDate: gen.created_at ? new Date(gen.created_at) : new Date(0),
        });
      });
    }

    if (sessions?.sessions) {
      sessions.sessions.slice(0, 2).forEach((s) => {
        list.push({
          id: `chat-${s.id}`,
          type: 'chat',
          title: s.title || 'MIRA Chat',
          description: `${s.message_count} message${s.message_count !== 1 ? 's' : ''}`,
          timestamp: s.updated_at ? formatTimestamp(s.updated_at) : 'Recently',
          sortDate: s.updated_at ? new Date(s.updated_at) : new Date(0),
        });
      });
    }

    return list
      .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
      .slice(0, 5)
      .map(({ sortDate, ...a }) => a);
  }, [generations, sessions]);

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading workspace..." />;
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Here&apos;s your cultural intelligence overview.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity activities={activities} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
