'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { ErrorMessage } from '@/components/errors';
import { api } from '@/lib/api';
import type { Document } from '@/types/api';
import { FileText, X, CheckCircle } from 'lucide-react';

interface DocumentSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  orgId?: string;
}

export function DocumentSelector({ selectedIds, onSelectionChange, orgId }: DocumentSelectorProps) {
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
    if (selectedIds.includes(docId)) {
      onSelectionChange(selectedIds.filter(id => id !== docId));
    } else {
      onSelectionChange([...selectedIds, docId]);
    }
  };

  const selectedDocs = documents.filter(doc => selectedIds.includes(doc.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Include Documents (Optional)</label>
        {selectedIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
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
          No completed documents available. Upload documents first.
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto border border-[var(--border)] rounded-lg p-3">
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
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-[var(--muted-foreground)] flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{doc.title}</span>
                  {isSelected && (
                    <CheckCircle className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
                  )}
                </div>
                <Badge variant="default" className="text-xs ml-2 flex-shrink-0">
                  {doc.chunk_count} chunks
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {selectedDocs.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">Selected documents:</p>
          <div className="flex flex-wrap gap-2">
            {selectedDocs.map((doc) => (
              <Badge
                key={doc.id}
                variant="default"
                className="flex items-center gap-1"
              >
                {doc.title}
                <button
                  type="button"
                  onClick={() => toggleDocument(doc.id)}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
