'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

const ROTATING_WORDS = ['Culture', 'Identity', 'Behavior', 'Audience', 'Strategy', 'Activation'];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`text-2xl sm:text-3xl font-bold text-[var(--primary)] transition-opacity duration-400 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {ROTATING_WORDS[index]}
    </span>
  );
}

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
            Cultural Intelligence for
            <br />
            <span className="text-[var(--primary)]">Modern Marketers</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-[var(--muted-foreground)] mb-12 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Build persona-driven campaigns rooted in culture, identity, and real consumer behavior — then activate them instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link href="/register">
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

      {/* Rotating Words Section */}
      <div className="border-t border-b border-[var(--border)] py-6 overflow-hidden">
        <div className="flex justify-center">
          <RotatingWord />
        </div>
      </div>
    </section>
  );
}
