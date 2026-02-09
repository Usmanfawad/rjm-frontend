'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner, EmptyState } from '@/components/layout';
import { DocumentCard, DocumentUpload } from '@/components/documents';
import { Button, ErrorMessage, ConfirmationDialog } from '@/components/ui';
import { useAuthGuard, useApiQuery, useApiMutation } from '@/hooks';
import { api } from '@/lib/api';
import { ROUTES, API_CONFIG } from '@/constants';
import { FileText, Upload, Search, RefreshCw } from 'lucide-react';
import type { DocumentStatus } from '@/types/api';

type DocumentFilter = 'all' | DocumentStatus;

export default function DocumentsPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState<DocumentFilter>('all');
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const { data: documentsData, loading, error, refetch } = useApiQuery(
    () => api.listDocuments({
      status: filter !== 'all' ? filter : undefined,
      limit: API_CONFIG.DEFAULT_LIMIT,
    }),
    { enabled: isReady }
  );

  // Refetch when filter changes
  useEffect(() => {
    if (isReady) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]); // Only refetch when filter changes

  const { mutate: deleteDocument, loading: deleting } = useApiMutation(
    (docId: string) => api.deleteDocument(docId),
    {
      onSuccess: () => {
        refetch();
        setDocumentToDelete(null);
      },
    }
  );

  const documents = documentsData?.documents || [];

  const handleDeleteClick = (docId: string, docTitle: string) => {
    setDocumentToDelete({ id: docId, title: docTitle });
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocument(documentToDelete.id);
    } catch (err) {
      // Error handled by useApiMutation
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    refetch();
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.syncDocuments();
      refetch();
    } catch {
      // Silently handle
    } finally {
      setSyncing(false);
    }
  };

  const filterOptions: DocumentFilter[] = ['all', 'completed', 'processing', 'failed'];

  if (!isReady || loading) {
    return <LoadingSpinner fullScreen message="Loading documents..." />;
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Documents"
          description="Upload and manage documents to enhance your persona program generation"
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSync} disabled={syncing} isLoading={syncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button variant="outline" onClick={() => router.push(ROUTES.DOCUMENTS_SEARCH)}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button onClick={() => setShowUpload(!showUpload)} size="lg">
                <Upload className="h-5 w-5 mr-2" />
                Upload Document
              </Button>
            </div>
          }
        />

        {showUpload && (
          <div className="mb-6">
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-8 p-1 bg-[var(--muted)] rounded-lg inline-flex">
          {filterOptions.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${
                  filter === status
                    ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }
              `}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <ErrorMessage
            error={error}
            context="DocumentsPage"
            onDismiss={refetch}
            className="mb-6"
          />
        )}

        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload your first document to enhance your persona program generation"
            action={{
              label: 'Upload Document',
              onClick: () => setShowUpload(true),
            }}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={() => handleDeleteClick(doc.id, doc.title)} />
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Document"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </PageLayout>
  );
}
