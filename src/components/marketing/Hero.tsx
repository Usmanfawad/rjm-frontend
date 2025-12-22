'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl">
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-8 animate-fade-in">
            Cultural Media
            <br />
            <span className="text-[var(--primary)]">Reimagined</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-[var(--muted-foreground)] mb-12 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Empowering authentic voices through AI-powered persona intelligence.
            Connect with audiences through cultural understanding.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link href="/register">
              <Button size="lg" className="min-w-[200px] group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="border-t border-b border-[var(--border)] py-6 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="inline-flex items-center text-lg sm:text-xl font-medium">
            <span className="mx-8">Authenticity</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Creativity</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Community</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Relatability</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Expression</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Authenticity</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Creativity</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Community</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Relatability</span>
            <span className="text-[var(--primary)]">/</span>
            <span className="mx-8">Expression</span>
            <span className="text-[var(--primary)]">/</span>
          </span>
        </div>
      </div>
    </section>
  );
}
