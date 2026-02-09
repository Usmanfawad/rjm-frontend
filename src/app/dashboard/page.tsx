'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageLayout, LoadingSpinner } from '@/components/layout';
import { StatsCard, RecentActivity, QuickActions } from '@/components/dashboard';
import { useAuthGuard } from '@/hooks';
import { useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { ROUTES } from '@/constants';
import { FileText, MessageSquare, Sparkles, Building2, Shield } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isReady } = useAuthGuard();

  // Fetch all stats in parallel
  const { data: generations } = useApiQuery(
    () => api.getPersonaGenerations(50, 0), // Fetch more to get accurate total
    { enabled: isReady }
  );
  const { data: sessions } = useApiQuery(
    () => api.getChatSessions(),
    { enabled: isReady }
  );
  const { data: documents } = useApiQuery(
    () => api.listDocuments({ limit: 10 }),
    { enabled: isReady }
  );
  const { data: organizations } = useApiQuery(
    () => api.listOrganizations(),
    { enabled: isReady }
  );
  const { data: governance } = useApiQuery(
    () => api.getDashboardStats(),
    { enabled: isReady }
  );

  const stats = useMemo(() => ({
    programs: generations?.total || 0,
    sessions: sessions?.total || 0,
    documents: documents?.total || 0,
    organizations: Array.isArray(organizations) ? organizations.length : 0,
    governance: {
      total: governance?.total_count || 0,
      live: governance?.live_count || 0,
    },
  }), [generations, sessions, documents, organizations, governance]);

  // All hooks must be called before any conditional returns
  const statsCards = useMemo(() => [
    {
      title: 'Persona Programs',
      value: stats.programs.toString(),
      change: 'Total programs in your library',
      changeType: 'neutral' as const,
      icon: Sparkles,
      link: ROUTES.PERSONAS,
    },
    {
      title: 'Chat Sessions',
      value: stats.sessions.toString(),
      change: 'Total MIRA conversations',
      changeType: 'neutral' as const,
      icon: MessageSquare,
      link: ROUTES.CHAT,
    },
    {
      title: 'Documents',
      value: stats.documents.toString(),
      change: 'Ready for context',
      changeType: 'neutral' as const,
      icon: FileText,
      link: ROUTES.DOCUMENTS,
    },
    {
      title: 'Organizations',
      value: stats.organizations.toString(),
      change: 'Team workspaces',
      changeType: 'neutral' as const,
      icon: Building2,
      link: ROUTES.ORGANIZATIONS,
    },
    {
      title: 'Live Programs',
      value: stats.governance.live.toString(),
      change: `${stats.governance.total} total governed`,
      changeType: 'positive' as const,
      icon: Shield,
      link: ROUTES.GOVERNANCE,
    },
  ], [stats]);

  // Helper function to format timestamps
  const formatTimestamp = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  // Build activities from real data
  const activities = useMemo(() => {
    const activityList: Array<{
      id: string;
      type: 'generation' | 'chat' | 'document';
      title: string;
      description: string;
      timestamp: string;
      sortDate: Date;
    }> = [];

    // Add recent generations
    if (generations?.generations && generations.generations.length > 0) {
      generations.generations.slice(0, 3).forEach((gen) => {
        activityList.push({
          id: `gen-${gen.id}`,
          type: 'generation',
          title: gen.program_json?.header || gen.brand_name || 'Persona Program',
          description: `Generated persona program${gen.brand_name ? ` for ${gen.brand_name}` : ''}`,
          timestamp: gen.created_at ? formatTimestamp(gen.created_at) : 'Recently',
          sortDate: gen.created_at ? new Date(gen.created_at) : new Date(0),
        });
      });
    }

    // Add recent chat sessions
    if (sessions?.sessions && sessions.sessions.length > 0) {
      sessions.sessions.slice(0, 2).forEach((session) => {
        activityList.push({
          id: `chat-${session.id}`,
          type: 'chat',
          title: session.title || 'MIRA Chat Session',
          description: session.message_count > 0 ? `${session.message_count} message${session.message_count > 1 ? 's' : ''}` : 'Chat session with MIRA',
          timestamp: session.updated_at ? formatTimestamp(session.updated_at) : 'Recently',
          sortDate: session.updated_at ? new Date(session.updated_at) : new Date(0),
        });
      });
    }

    // Add recent documents
    if (documents?.documents && documents.documents.length > 0) {
      documents.documents.slice(0, 2).forEach((doc) => {
        activityList.push({
          id: `doc-${doc.id}`,
          type: 'document',
          title: doc.title,
          description: doc.status === 'completed' ? 'Document ready for use' : 'Document uploaded',
          timestamp: doc.created_at ? formatTimestamp(doc.created_at) : 'Recently',
          sortDate: doc.created_at ? new Date(doc.created_at) : new Date(0),
        });
      });
    }

    // Sort by timestamp (most recent first) and limit to 5
    return activityList
      .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
      .slice(0, 5)
      .map(({ sortDate, ...activity }) => activity); // Remove sortDate from final result
  }, [generations, sessions, documents]);

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            Here&apos;s your cultural intelligence overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content */}
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
