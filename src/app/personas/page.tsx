'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { api } from '@/lib/api';
import type { PersonaGeneration } from '@/types/api';
import {
  Loader2,
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [generations, setGenerations] = useState<PersonaGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGenerations();
    }
  }, [isAuthenticated]);

  const fetchGenerations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getPersonaGenerations();
      if (response.success && response.data) {
        setGenerations(response.data.generations);
      } else {
        setError(response.error || 'Failed to load persona generations');
      }
    } catch {
      setError('Failed to load persona generations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--foreground)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Persona Programs
              </h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                Your generated persona programs from chat and the generator
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGenerations}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)] mb-4" />
              <p className="text-[var(--muted-foreground)]">Loading your persona programs...</p>
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchGenerations}>
                Try Again
              </Button>
            </Card>
          ) : generations.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Persona Programs Yet</h3>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                Start by chatting with MIRA or using the generator to create your first persona program.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => router.push('/chat')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with MIRA
                </Button>
                <Button onClick={() => router.push('/generator')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use Generator
                </Button>
              </div>
            </Card>
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
                          {formatDate(gen.created_at)}
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
      </main>
      <Footer />
    </div>
  );
}

