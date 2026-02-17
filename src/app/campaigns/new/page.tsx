'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, PageHeader, LoadingSpinner } from '@/components/layout';
import { GeneratorForm, ProgramResult } from '@/components/generator';
import { Button } from '@/components/ui';
import { useAuthGuard } from '@/hooks';
import { ROUTES } from '@/constants';
import type { GenerateProgramResponse } from '@/types/api';
import { ArrowLeft } from 'lucide-react';

export default function NewCampaignPage() {
  const { isReady } = useAuthGuard();
  const router = useRouter();
  const [result, setResult] = useState<GenerateProgramResponse | null>(null);

  if (!isReady) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  const handleGenerate = (data: GenerateProgramResponse) => {
    setResult(data);
    // If a generation_id is returned, redirect to the campaign detail
    if (data.generation_id) {
      router.push(`/campaigns/${data.generation_id}`);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title={result ? 'Your Persona Program' : 'New Campaign'}
          description={
            result
              ? 'Your persona program is ready for review and activation.'
              : 'Enter your brand details and campaign brief to build a customized persona program.'
          }
        >
          {result ? (
            <Button variant="ghost" size="sm" onClick={handleReset} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Build Another
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(ROUTES.CAMPAIGNS)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          )}
        </PageHeader>

        {result ? (
          <ProgramResult result={result} />
        ) : (
          <GeneratorForm onGenerate={handleGenerate} />
        )}
      </div>
    </PageLayout>
  );
}
