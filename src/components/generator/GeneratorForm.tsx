'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { DocumentSelector } from '@/components/documents';
import { ErrorMessage } from '@/components/errors';
import { api } from '@/lib/api';
import type { Document, GenerateProgramResponse } from '@/types/api';
import { Sparkles, Loader2 } from 'lucide-react';

interface GeneratorFormProps {
  onGenerate: (result: GenerateProgramResponse) => void;
  orgId?: string;
}

export function GeneratorForm({ onGenerate, orgId }: GeneratorFormProps) {
  const [brandName, setBrandName] = useState('');
  const [brief, setBrief] = useState('');
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDocumentsChange = (docs: Document[]) => {
    const summaries = docs
      .map(doc => doc.summary)
      .filter(Boolean)
      .join('\n\n');
    if (!summaries) return;
    setBrief(prev => {
      if (!prev.trim()) return summaries;
      // Append summary if not already present
      if (prev.includes(summaries)) return prev;
      return prev.trim() + '\n\n' + summaries;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!brandName.trim()) {
      setError('Please provide a brand name to build your program.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.generateProgram({
        brand_name: brandName.trim(),
        brief: brief.trim() || brandName.trim(),
        document_ids: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
      });

      if (response.success && response.data) {
        onGenerate(response.data);
      } else {
        setError(response.error || response.detail || 'Generation failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Build Persona Campaign
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Brand or Organization"
            placeholder="Enter your brand or organization name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            error={!brandName && error ? 'Brand name is required' : undefined}
          />

          <Textarea
            label="Campaign Objective (Optional)"
            placeholder="Describe what you're launching or trying to achieve."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={6}
            error={undefined}
          />

          <DocumentSelector
            selectedIds={selectedDocumentIds}
            onSelectionChange={setSelectedDocumentIds}
            onDocumentsChange={handleDocumentsChange}
            orgId={orgId}
          />

          {error && !!brandName && (
            <ErrorMessage
              error={error}
              context="GeneratorForm"
              onDismiss={() => setError('')}
            />
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating persona framework...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Persona Framework
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
