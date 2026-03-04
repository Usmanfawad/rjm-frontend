'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { ErrorMessage } from '@/components/errors';
import { api } from '@/lib/api';
import type { Document } from '@/types/api';
import { FileText, X, CheckCircle } from 'lucide-react';

interface DocumentSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDocumentsChange?: (docs: Document[]) => void;
  orgId?: string;
}

export function DocumentSelector({ selectedIds, onSelectionChange, onDocumentsChange, orgId }: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    loadDocuments();
  }, [orgId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.listDocuments({
        org_id: orgId,
        status: 'completed', // Only show completed documents
        limit: 100,
      });
      if (response.success && response.data) {
        setDocuments(response.data.documents);
      } else {
        setError(response.error || response.detail);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = (docId: string) => {
    let newIds: string[];
    if (selectedIds.includes(docId)) {
      newIds = selectedIds.filter(id => id !== docId);
    } else {
      newIds = [...selectedIds, docId];
    }
    onSelectionChange(newIds);
    if (onDocumentsChange) {
      onDocumentsChange(documents.filter(doc => newIds.includes(doc.id)));
    }
  };

  const selectedDocs = documents.filter(doc => selectedIds.includes(doc.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Attach Brief (Optional)</label>
        {selectedIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onSelectionChange([]); onDocumentsChange?.([]); }}
          >
            Clear ({selectedIds.length})
          </Button>
        )}
      </div>

      {error !== null && (
        <ErrorMessage
          error={error}
          context="DocumentSelector"
          onDismiss={() => setError(null)}
        />
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          No briefs uploaded yet.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto border border-[var(--border)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted-foreground)] mb-1">Select a brief to apply to this campaign.</p>
          {documents.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => toggleDocument(doc.id)}
                className={`w-full flex items-center justify-between p-2 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] hover:bg-[var(--accent)]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{doc.title}</span>
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
                    )}
                  </div>
                  {isSelected && doc.summary && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 ml-6 line-clamp-2 text-left">
                      {doc.summary}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedDocs.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">Selected briefs:</p>
          <div className="flex flex-wrap gap-2">
            {selectedDocs.map((doc) => (
              <span
                key={doc.id}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--accent)] border border-[var(--border)]"
              >
                {doc.title}
                <button
                  type="button"
                  onClick={() => toggleDocument(doc.id)}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
