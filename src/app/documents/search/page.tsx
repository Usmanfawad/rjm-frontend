'use client';

import { useState } from 'react';
import { PageLayout, PageHeader, LoadingSpinner, EmptyState } from '@/components/layout';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, ErrorMessage } from '@/components/ui';
import { useAuthGuard, useApiMutation } from '@/hooks';
import { api } from '@/lib/api';
import { Search, FileText } from 'lucide-react';

export default function DocumentSearchPage() {
  const { isReady } = useAuthGuard();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ document_id: string; document_title: string; chunk_text: string; score: number }>>([]);

  const { mutate: searchDocuments, loading: searching, error } = useApiMutation(
    (searchQuery: string) => api.searchDocuments({
      query: searchQuery.trim(),
      limit: 20,
    }),
    {
      onSuccess: (data) => {
        setResults(data.results || []);
      },
    }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      await searchDocuments(query);
    } catch (err) {
      // Error handled by useApiMutation
    }
  };

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <Search className="h-8 w-8" />
              Document Search
            </div>
          }
          description="Search your documents using semantic search"
        />

        <Card variant="elevated" className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="lg" isLoading={searching}>
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <ErrorMessage
            error={error}
            context="DocumentSearchPage"
            className="mb-6"
          />
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Search Results ({results.length})</h2>
            {results.map((result, idx) => (
              <Card key={idx} variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {result.document_title}
                    </CardTitle>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {(result.score * 100).toFixed(1)}% match
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">
                    {result.chunk_text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!searching && results.length === 0 && query && (
          <EmptyState
            icon={Search}
            title="No results found"
            description="Try different search terms"
          />
        )}
      </div>
    </PageLayout>
  );
}
