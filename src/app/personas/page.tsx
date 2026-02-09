'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner, EmptyState } from '@/components/layout';
import { Card, Button, ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiQuery } from '@/hooks';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/constants';
import {
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  FileText,
  RefreshCw,
} from 'lucide-react';

export default function PersonasPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const { data: generationsData, loading, error, refetch } = useApiQuery(
    () => api.getPersonaGenerations(),
    { enabled: isReady }
  );

  const generations = generationsData?.generations || [];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading persona programs..." />;
  }

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Program Library"
          description="View and manage all your persona programs"
          action={
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          }
        />

        {error && (
          <ErrorMessage
            error={error}
            context="PersonasPage"
            onDismiss={refetch}
            className="mb-6"
          />
        )}

        {generations.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No programs yet"
            description="Build your first persona program using the generator or chat with MIRA."
            action={{
              label: 'Build Program',
              onClick: () => router.push(ROUTES.GENERATOR),
            }}
          />
        ) : (
            <div className="space-y-4">
              {generations.map((gen) => (
                <Card
                  key={gen.id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  {/* Card Header */}
                  <button
                    onClick={() => toggleExpand(gen.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-[var(--accent)]/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {gen.brand_name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            gen.source === 'chat'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {gen.source === 'chat' ? (
                            <>
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Chat
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 mr-1" />
                              Generator
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                        {gen.brief}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted-foreground)]">
                        {gen.advertising_category && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {gen.advertising_category}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(gen.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {expandedId === gen.id ? (
                        <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)]" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedId === gen.id && (
                    <div className="border-t border-[var(--border)] p-5 bg-[var(--accent)]/20">
                      <h4 className="font-medium mb-3 text-sm uppercase tracking-wide text-[var(--muted-foreground)]">
                        Generated Program
                      </h4>
                      <div className="bg-[var(--background)] rounded-lg p-4 border border-[var(--border)]">
                        <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                          {gen.program_text}
                        </pre>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
        )}
      </div>
    </PageLayout>
  );
}

