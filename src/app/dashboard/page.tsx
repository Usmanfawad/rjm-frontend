'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar, Footer } from '@/components/layout';
import { StatsCard, RecentActivity, QuickActions } from '@/components/dashboard';
import { FileText, MessageSquare, Sparkles, TrendingUp, Loader2 } from 'lucide-react';

export default function DashboardPage() {
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

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      title: 'Programs Generated',
      value: '12',
      change: '+3 this week',
      changeType: 'positive' as const,
      icon: Sparkles,
    },
    {
      title: 'Chat Sessions',
      value: '28',
      change: '+8 this week',
      changeType: 'positive' as const,
      icon: MessageSquare,
    },
    {
      title: 'Documents Synced',
      value: '5',
      change: 'Up to date',
      changeType: 'neutral' as const,
      icon: FileText,
    },
    {
      title: 'Usage Trend',
      value: '+24%',
      change: 'vs last month',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
  ];

  const activities = [
    {
      id: '1',
      type: 'generation' as const,
      title: 'Nike Campaign Program',
      description: 'Generated persona program for sports apparel campaign',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'chat' as const,
      title: 'MIRA Strategy Session',
      description: 'Discussed activation plan for Q1 campaign',
      timestamp: '5 hours ago',
    },
    {
      id: '3',
      type: 'document' as const,
      title: 'Brand Guidelines Synced',
      description: 'Updated brand guidelines document',
      timestamp: 'Yesterday',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              Here&apos;s what&apos;s happening with your cultural intelligence.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
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
      </main>
      <Footer />
    </div>
  );
}
