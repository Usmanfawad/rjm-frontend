'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { ErrorMessage } from '@/components/errors';
import { api } from '@/lib/api';
import type { Document } from '@/types/api';
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  orgId?: string;
  onUploadComplete?: (document: Document) => void;
}

export function DocumentUpload({ orgId, onUploadComplete }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<unknown>(null);
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
      const validExtensions = ['.pdf', '.docx', '.txt', '.md'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
        setError('Unsupported file type. Please upload PDF, DOCX, TXT, or MD files.');
        return;
      }

      // Validate file size (25MB limit)
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('File too large. Maximum size is 25MB.');
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadStatus('uploading');
    setError(null);

    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const response = await api.uploadDocument(
        file,
        title || undefined,
        description || undefined,
        orgId,
        tagArray.length > 0 ? tagArray : undefined
      );

      if (response.success && response.data) {
        setUploadedDoc(response.data);
        setUploadStatus('processing');
        
        // Poll for processing completion
        await pollDocumentStatus(response.data.id);
      } else {
        setError(response.error || response.detail || 'Upload failed');
        setUploadStatus('error');
      }
    } catch (err) {
      setError(err);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const pollDocumentStatus = async (docId: string) => {
    const maxAttempts = 30; // 30 attempts = 1 minute max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await api.getDocumentStatus(docId);
        if (response.success && response.data) {
          if (response.data.status === 'completed') {
            setUploadStatus('success');
            if (response.data) {
              const docResponse = await api.getDocument(docId);
              if (docResponse.success && docResponse.data) {
                setUploadedDoc(docResponse.data);
                onUploadComplete?.(docResponse.data);
              }
            }
            return;
          } else if (response.data.status === 'failed') {
            setError(response.data.processing_error || 'Processing failed');
            setUploadStatus('error');
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          setError('Processing timeout. Please check document status later.');
          setUploadStatus('error');
        }
      } catch (err) {
        console.error('Error polling document status:', err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      }
    };

    poll();
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setTags('');
    setUploadStatus('idle');
    setError(null);
    setUploadedDoc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadStatus === 'success' && uploadedDoc ? (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Document uploaded and processing.</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {uploadedDoc.title} will be ready shortly.
            </p>
            <Button onClick={handleReset} variant="outline" className="mt-3" size="sm">
              Upload Another
            </Button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">File</label>
              <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:border-[var(--primary)] transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-2">
                      <File className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-[var(--muted-foreground)] mb-2" />
                      <p className="text-sm font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        PDF, DOCX, TXT, MD (max 25MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Input
              label="Title"
              placeholder="Document title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Description (optional)</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document"
              />
            </div>

            <Input
              label="Tags (comma-separated, optional)"
              placeholder="marketing, strategy, q1"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />

            {error && (
              <ErrorMessage
                error={error}
                context="DocumentUpload"
                onDismiss={() => setError('')}
              />
            )}

            {uploadStatus === 'processing' && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                <p className="text-sm text-blue-500">Processing your document...</p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading || uploadStatus === 'processing'}
              className="w-full"
              size="lg"
              isLoading={uploading || uploadStatus === 'processing'}
            >
              {uploadStatus === 'processing' ? 'Processing...' : uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Document'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
