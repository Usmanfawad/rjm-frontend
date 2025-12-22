'use client';

import { useState } from 'react';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { api } from '@/lib/api';
import type { GenerateProgramResponse } from '@/types/api';
import { Sparkles, Loader2 } from 'lucide-react';

interface GeneratorFormProps {
  onGenerate: (result: GenerateProgramResponse) => void;
}

export function GeneratorForm({ onGenerate }: GeneratorFormProps) {
  const [brandName, setBrandName] = useState('');
  const [brief, setBrief] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!brandName.trim() || !brief.trim()) {
      setError('Please fill in both brand name and brief');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.generateProgram({
        brand_name: brandName.trim(),
        brief: brief.trim(),
      });

      if (response.success && response.data) {
        onGenerate(response.data);
      } else {
        setError(response.detail || response.error || 'Generation failed');
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
          Generate Persona Program
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Brand Name"
            placeholder="Enter your brand name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            error={!brandName && error ? 'Brand name is required' : undefined}
          />

          <Textarea
            label="Campaign Brief"
            placeholder="Describe your campaign objectives, target audience, and any specific requirements..."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={6}
            error={!brief && error ? 'Brief is required' : undefined}
            helperText="Be specific about your target demographics, campaign goals, and cultural contexts you want to explore."
          />

          {error && !(!brandName || !brief) && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Program
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
