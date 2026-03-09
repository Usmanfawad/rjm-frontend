import { Navbar, Footer } from '@/components/layout';
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {detailedFeatures.map((feature) => (
                <Card key={feature.title} variant="elevated">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)] flex items-center justify-center mb-4">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{feature.description}</p>
                  </CardContent>
                </Card>
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-white text-[var(--primary)] hover:opacity-90 transition-opacity"
              >
                Start Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
