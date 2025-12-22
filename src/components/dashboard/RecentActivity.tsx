'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { FileText, MessageSquare, Sparkles } from 'lucide-react';

interface Activity {
  id: string;
  type: 'generation' | 'chat' | 'document';
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'generation':
        return <Sparkles className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: Activity['type']) => {
    switch (type) {
      case 'generation':
        return 'success';
      case 'chat':
        return 'info';
      case 'document':
        return 'default';
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-[var(--muted-foreground)]">
            No recent activity
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {activities.map((activity) => (
              <li key={activity.id} className="p-4 hover:bg-[var(--accent)] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-[var(--muted-foreground)]">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <Badge variant={getBadgeVariant(activity.type)} className="capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
