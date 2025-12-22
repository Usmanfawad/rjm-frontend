import { Navbar, Footer } from '@/components/layout';
import { Features } from '@/components/marketing';
import { Card, CardContent } from '@/components/ui';
import {
  Sparkles,
  Users,
  Globe,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

const detailedFeatures = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description:
      'Our advanced AI analyzes your brand brief and automatically generates culturally-relevant persona programs. Powered by the MIRA Ingredient Canon, it understands the nuances of different advertising categories and cultural contexts.',
    highlights: [
      '13 advertising categories',
      'Instant program generation',
      'Brand-specific customization',
    ],
  },
  {
    icon: Users,
    title: 'Comprehensive Persona Library',
    description:
      'Access over 300 core personas mapped to specific advertising categories and cultural phyla. Each persona comes with detailed behavioral insights and activation recommendations.',
    highlights: [
      '300+ core personas',
      '22 cultural phyla',
      'Behavioral insights',
    ],
  },
  {
    icon: Globe,
    title: 'Multicultural Intelligence',
    description:
      'Reach diverse audiences with our 6 multicultural expression lineages. Our system understands cultural nuances across Black American, Latino/Hispanic, AAPI, South Asian, MENA, and Hybrid communities.',
    highlights: [
      '6 cultural lineages',
      'Cultural authenticity',
      'Inclusive marketing',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Generational Targeting',
    description:
      'Precise generational targeting with 32 segments across Gen Z, Millennial, Gen X, and Boomer cohorts. Understand the unique values, behaviors, and media preferences of each generation.',
    highlights: [
      '32 generational segments',
      '4 cohort groups',
      'Behavioral mapping',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Powerful Features for{' '}
              <span className="text-[var(--primary)]">
                Cultural Intelligence
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-[var(--muted-foreground)]">
              Discover how MIRA transforms your marketing strategy with AI-powered persona
              intelligence and cultural insights.
            </p>
          </div>
        </section>

        {/* Detailed Features */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {detailedFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`flex flex-col ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
                  } gap-12 items-center`}
                >
                  <div className="flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center mb-6">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                      {feature.title}
                    </h2>
                    <p className="text-[var(--muted-foreground)] mb-6">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <Card variant="elevated" className="aspect-video flex items-center justify-center bg-[var(--accent)]">
                      <CardContent className="text-center">
                        <feature.icon className="h-16 w-16 text-[var(--muted-foreground)] mx-auto" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Features Grid */}
        <Features />

        {/* CTA Section */}
        <section className="py-20 bg-[var(--primary)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join leading brands using MIRA to create culturally-relevant marketing campaigns.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-[var(--primary)] hover:opacity-90">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
