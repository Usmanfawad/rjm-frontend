'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';
import { Sparkles } from 'lucide-react';

const EXAMPLE_PERSONAS = [
  {
    name: 'Morning Stroll',
    description: 'Wellness focused consumers building calm daily routines.',
  },
  {
    name: 'Prime Mover',
    description: 'Ambitious consumers focused on growth and performance.',
  },
  {
    name: 'Sports Parent',
    description: 'Parents balancing family life with sports and activity.',
  },
  {
    name: 'Weekend Warrior',
    description: 'Recreational competitors motivated by fitness and outdoor challenge.',
  },
  {
    name: 'Biohacker',
    description: 'Performance driven consumers optimizing health and training.',
  },
  {
    name: 'Basketball Junkie',
    description: 'Fans whose lifestyle and identity revolve around the game.',
  },
  {
    name: 'Country Mile',
    description: 'Outdoor oriented consumers drawn to nature and distance.',
  },
  {
    name: 'Gen Z Main Character Energy',
    description: 'A generation that expresses identity through culture and content.',
  },
  {
    name: 'Everyday Joy',
    description: 'Black cultural identity centered around celebration and community.',
  },
  {
    name: 'Miami Culture',
    description: 'A local lifestyle defined by nightlife, music, and coastal energy.',
  },
];

export default function PersonasPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        {/* SECTION 1 — HERO HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">RJM Personas</h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Predictive audience models for advertising.
          </p>
        </div>

        {/* SECTION 2 — WHAT RJM PERSONAS ARE */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">What RJM Personas Are</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            RJM Personas are consumer profiles that help marketers structure campaigns around
            real behaviors, motivations, and cultural signals instead of relying only on demographics
            or basic audience segments.
          </p>
        </div>

        {/* SECTION 3 — HOW THEY ARE USED */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">How They Are Used</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            RJM Personas help organize advertising strategy across categories such as retail, travel,
            finance, automotive, food, entertainment, and technology.
          </p>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            They give marketers a clearer way to define audiences before campaigns are activated
            across media platforms.
          </p>
        </div>

        {/* SECTION 4 — EXAMPLE PERSONAS */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Example Personas</h2>
          <div className="grid gap-3">
            {EXAMPLE_PERSONAS.map((p) => (
              <div
                key={p.name}
                className="flex items-start justify-between p-3 rounded-lg bg-[var(--accent)]"
              >
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5 — CTA */}
        <div className="text-center">
          <Link href={ROUTES.CAMPAIGNS_NEW}>
            <Button size="lg" className="px-8">
              <Sparkles className="mr-2 h-4 w-4" />
              Build Campaign
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
