'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import { ErrorMessage } from '@/components/errors';
import { api } from '@/lib/api';
import type { Document } from '@/types/api';
import { FileText, X, CheckCircle, Upload, Loader2 } from 'lucide-react';

interface DocumentSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDocumentsChange?: (docs: Document[]) => void;
  orgId?: string;
}

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.txt,.md';

export function DocumentSelector({ selectedIds, onSelectionChange, onDocumentsChange, orgId }: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [orgId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.listDocuments({
        org_id: orgId,
        status: 'completed',
        limit: 100,
      });
      if (response.success && response.data) {
        // Filter out system artifacts — only show user-uploaded briefs
        const SYSTEM_ARTIFACTS = ['automated-treatment-plan-generation'];
        const userDocs = response.data.documents.filter(
          (doc) => !SYSTEM_ARTIFACTS.includes(doc.title?.toLowerCase().replace(/\s+/g, '-') || '')
            && !SYSTEM_ARTIFACTS.includes(doc.title || '')
        );
        setDocuments(userDocs);
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

  const pollUntilReady = async (docId: string, maxAttempts = 30): Promise<Document | null> => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await api.getDocument(docId);
        if (res.success && res.data) {
          if (res.data.status === 'completed') return res.data;
          if (res.data.status === 'failed') return null;
        }
      } catch {
        // keep polling
      }
    }
    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected
    e.target.value = '';

    setUploading(true);
    setUploadStatus('Uploading...');
    setError(null);

    try {
      const uploadRes = await api.uploadDocument(file, file.name, undefined, orgId);
      if (!uploadRes.success || !uploadRes.data) {
        setError(uploadRes.error || uploadRes.detail || 'Upload failed');
        setUploading(false);
        setUploadStatus('');
        return;
      }

      const docId = uploadRes.data.id;
      setUploadStatus('Processing document...');

      const completedDoc = await pollUntilReady(docId);
      if (completedDoc) {
        // Add to document list and auto-select
        setDocuments(prev => [completedDoc, ...prev]);
        const newIds = [...selectedIds, completedDoc.id];
        onSelectionChange(newIds);
        onDocumentsChange?.([...documents.filter(d => selectedIds.includes(d.id)), completedDoc]);
        setUploadStatus('');
      } else {
        setError('Document processing failed. Please try again.');
        setUploadStatus('');
      }
    } catch (err) {
      setError(err);
      setUploadStatus('');
    } finally {
      setUploading(false);
    }
  };

  const selectedDocs = documents.filter(doc => selectedIds.includes(doc.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Attach Brief (Optional)</label>
        <div className="flex items-center gap-2">
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
      </div>

      {error !== null && (
        <ErrorMessage
          error={error}
          context="DocumentSelector"
          onDismiss={() => setError(null)}
        />
      )}

      {/* Upload inline */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5"
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {uploadStatus}
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload Brief
            </>
          )}
        </Button>
        <span className="text-xs text-[var(--muted-foreground)]">PDF, DOCX, TXT, MD</span>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          No briefs uploaded yet. Upload one above.
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
