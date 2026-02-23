'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
            What <span className="text-[var(--primary)]">MIRA Persona Engine</span>
            <br />
            Does
          </h2>

          <div className="text-xl text-[var(--muted-foreground)] mb-12 max-w-xl space-y-4">
            <p>MIRA Persona Engine translates brand inputs into structured, activation-ready persona frameworks.</p>
            <p>From brief to deployment in minutes.</p>
            <p>Built for brands, agencies, platforms, and data partners.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="min-w-[200px] group">
                Enter Persona Engine
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
