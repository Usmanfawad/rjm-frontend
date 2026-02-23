'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { DocumentSelector } from '@/components/documents';
import { ErrorMessage } from '@/components/errors';
import { api } from '@/lib/api';
import type { GenerateProgramResponse } from '@/types/api';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface GeneratorFormProps {
  onGenerate: (result: GenerateProgramResponse) => void;
  orgId?: string;
}

export function GeneratorForm({ onGenerate, orgId }: GeneratorFormProps) {
  const [brandName, setBrandName] = useState('');
  const [brief, setBrief] = useState('');
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [lineagesInput, setLineagesInput] = useState('');
  const [dmasInput, setDmasInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!brandName.trim() || !brief.trim()) {
      setError('Please provide both brand name and brief to build your program.');
      return;
    }

    setIsLoading(true);

    try {
      const lineages = lineagesInput.split(',').map(s => s.trim()).filter(Boolean);
      const dmas = dmasInput.split(',').map(s => s.trim()).filter(Boolean);

      const response = await api.generateProgram({
        brand_name: brandName.trim(),
        brief: brief.trim(),
        document_ids: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
        multicultural_lineages: lineages.length > 0 ? lineages : undefined,
        local_dmas: dmas.length > 0 ? dmas : undefined,
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
            placeholder="Describe what you're launching, promoting, or trying to achieve."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={6}
            error={!brief && error ? 'Objective is required' : undefined}
            helperText="Describe what you're launching, promoting, or trying to achieve."
          />

          <DocumentSelector
            selectedIds={selectedDocumentIds}
            onSelectionChange={setSelectedDocumentIds}
            orgId={orgId}
          />

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Attach Brief (Optional)
          </button>

          {showAdvanced && (
            <div className="space-y-4 p-4 rounded-lg border border-[var(--border)] bg-[var(--accent)]">
              <Input
                label="Multicultural Lineages"
                placeholder="e.g. African American, Hispanic, Asian American (comma-separated)"
                value={lineagesInput}
                onChange={(e) => setLineagesInput(e.target.value)}
              />
              <Input
                label="Local DMAs"
                placeholder="e.g. New York, Los Angeles, Chicago (comma-separated)"
                value={dmasInput}
                onChange={(e) => setDmasInput(e.target.value)}
              />
              <p className="text-xs text-[var(--muted-foreground)]">
                Upload RFPs, strategy documents, or brand materials to inform generation.
              </p>
            </div>
          )}

          {error && !(!brandName || !brief) && (
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
