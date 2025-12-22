'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar, Footer } from '@/components/layout';
import { GeneratorForm, ProgramResult } from '@/components/generator';
import type { GenerateProgramResponse } from '@/types/api';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function GeneratorPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [result, setResult] = useState<GenerateProgramResponse | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--foreground)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleGenerate = (data: GenerateProgramResponse) => {
    setResult(data);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            {result && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Generate New Program
              </Button>
            )}
            <h1 className="text-2xl font-bold">
              {result ? 'Your Persona Program' : 'Persona Program Generator'}
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              {result
                ? 'Here are the personas and activation strategies tailored to your campaign.'
                : 'Enter your brand details and campaign brief to generate a customized persona program.'}
            </p>
          </div>

          {/* Content */}
          {result ? (
            <ProgramResult result={result} />
          ) : (
            <GeneratorForm onGenerate={handleGenerate} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
