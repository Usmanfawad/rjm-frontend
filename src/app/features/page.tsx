import { Navbar, Footer } from '@/components/layout';
import { Features } from '@/components/marketing';
import { Card, CardContent } from '@/components/ui';
import {
  Sparkles,
  Users,
  Globe,
  MapPin,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

const detailedFeatures = [
  {
    icon: Sparkles,
    title: 'Framework Generation',
    description:
      'Generate structured persona programs from brand inputs and campaign objectives.',
  },
  {
    icon: Users,
    title: 'Audience Architecture',
    description:
      'Identity-based persona frameworks organized by category and behavioral logic.',
  },
  {
    icon: Globe,
    title: 'Cultural and Generational Overlays',
    description:
      'Refine campaigns with cohort and cultural context when alignment is required.',
  },
  {
    icon: MapPin,
    title: 'Local Intelligence',
    description:
      'Apply geographic nuance for regionally targeted campaigns.',
  },
  {
    icon: Layers,
    title: 'Activation Pathways',
    description:
      'Move from persona framework to live execution within your existing media ecosystem.',
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
              Persona Engine{' '}
              <span className="text-[var(--primary)]">
                Capabilities
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-[var(--muted-foreground)]">
              Explore how the Persona Engine structures strategy, audience logic, and activation into one clear system.
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
                    <p className="text-[var(--muted-foreground)]">{feature.description}</p>
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

        {/* CTA Section */}
        <section className="py-20 bg-[var(--primary)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Ready to Build With MIRA?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Let&apos;s start the conversation.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-[var(--primary)] hover:opacity-90">
                Enter Persona Engine
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
