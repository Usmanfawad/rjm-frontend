'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner, EmptyState } from '@/components/layout';
import { DocumentUpload } from '@/components/documents';
import { Button, ConfirmationDialog } from '@/components/ui';
import { useAuthGuard, useApiQuery, useApiMutation } from '@/hooks';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Upload, Search, Trash2 } from 'lucide-react';
import { ROUTES } from '@/constants';

export default function SettingsDocumentsPage() {
  const router = useRouter();
  const { isReady } = useAuthGuard();
  const [showUpload, setShowUpload] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: documents, loading, refetch } = useApiQuery(
    () => api.listDocuments({ limit: 50 }),
    { enabled: isReady },
  );

  const deleteMutation = useApiMutation(
    (id: string) => api.deleteDocument(id),
    {
      onSuccess: () => {
        setDeleteId(null);
        refetch();
      },
    },
  );

  if (!isReady || loading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  const docs = documents?.documents || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Documents</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => router.push(ROUTES.SETTINGS_DOCUMENTS_SEARCH)}>
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
          <Button size="sm" onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      {showUpload && (
        <div className="mb-6">
          <DocumentUpload
            onUploadComplete={() => {
              setShowUpload(false);
              refetch();
            }}
          />
        </div>
      )}

      {docs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload brand documents to enhance persona program generation with RAG context."
          action={{
            label: 'Upload Document',
            onClick: () => setShowUpload(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id} variant="elevated" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-[var(--primary)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {doc.chunk_count} chunks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      doc.status === 'completed'
                        ? 'success'
                        : doc.status === 'failed'
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {doc.status}
                  </Badge>
                  <button
                    onClick={() => setDeleteId(doc.id)}
                    className="p-1 hover:bg-[var(--accent)] rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
