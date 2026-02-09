'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
import type { Document, DocumentStatus } from '@/types/api';
import { formatFileSize } from '@/lib/format';
import { ROUTES } from '@/constants';
import { File, CheckCircle, Loader2, XCircle, Clock, Trash2, Search } from 'lucide-react';
import Link from 'next/link';

interface DocumentCardProps {
  document: Document;
  onDelete?: (docId: string) => void;
}

const statusConfig: Record<DocumentStatus, { icon: typeof File; color: string; label: string }> = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    label: 'Pending',
  },
  processing: {
    icon: Loader2,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    label: 'Processing',
  },
  completed: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'Failed',
  },
};

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const config = statusConfig[document.status];
  const Icon = config.icon;

  return (
    <Card variant="elevated" className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center flex-shrink-0 shadow-sm">
              <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold mb-1 line-clamp-2 leading-tight">
                {document.title}
              </CardTitle>
              <p className="text-xs text-[var(--muted-foreground)] truncate" title={document.filename}>
                {document.filename}
              </p>
            </div>
          </div>
          <Badge className={`${config.color} flex-shrink-0`}>
            <Icon className={`h-3 w-3 mr-1 ${document.status === 'processing' ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {document.description && (
          <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
            {document.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <span className="font-medium">{formatFileSize(document.file_size)}</span>
          </span>
          <span>•</span>
          <span>{document.chunk_count} chunks</span>
          {document.tags && document.tags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex flex-wrap gap-1.5">
                {document.tags.slice(0, 2).map((tag, idx) => (
                  <Badge key={idx} variant="default" className="text-xs px-1.5 py-0.5">
                    {tag}
                  </Badge>
                ))}
                {document.tags.length > 2 && (
                  <Badge variant="default" className="text-xs px-1.5 py-0.5">
                    +{document.tags.length - 2}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        {document.processing_error && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
            <p className="text-xs text-red-600 dark:text-red-400">{document.processing_error}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            {document.status === 'completed' && (
              <Link href={`${ROUTES.DOCUMENTS}/${document.id}`}>
                <Button variant="outline" size="sm" className="h-8">
                  <Search className="h-3.5 w-3.5 mr-1.5" />
                  View
                </Button>
              </Link>
            )}
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(document.id)}
              className="h-8 w-8 p-0 text-[var(--muted-foreground)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Delete document"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
