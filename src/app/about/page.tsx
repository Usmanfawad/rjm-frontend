import { Navbar, Footer } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                About{' '}
                <span className="text-[var(--primary)]">
                  MIRA
                </span>
              </h1>
              <p className="text-lg text-[var(--muted-foreground)] mb-6">
                MIRA Persona Engine is a cultural intelligence system that turns brand inputs into structured,
                activation-ready audience frameworks.
              </p>
              <p className="text-[var(--muted-foreground)]">
                We help brands, agencies, platforms, publishers, and data partners move from cultural insight to
                campaign execution with clarity and precision.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-[var(--accent)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-[var(--muted-foreground)] mb-4">
                  MIRA was built on a simple belief: effective marketing begins with understanding how people
                  actually live, decide, and move.
                </p>
                <p className="text-[var(--muted-foreground)]">
                  Traditional targeting relies on demographics and signals. MIRA organizes identity, behavior, and
                  cultural context into structured persona frameworks that marketers can deploy immediately.
                </p>
              </div>
              <Card variant="elevated" className="aspect-square flex items-center justify-center">
                <CardContent className="text-center">
                  <div className="text-6xl font-bold tracking-tight">
                    <span className="text-[var(--primary)]">M</span>IRA
                  </div>
                  <p className="text-[var(--muted-foreground)] mt-2">Cultural Intelligence</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How MIRA Thinks */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">
              How MIRA Thinks
            </h2>
            <div className="max-w-xl mx-auto space-y-6 text-center">
              <p className="text-xl text-[var(--muted-foreground)]">Culture shapes decisions.</p>
              <p className="text-xl text-[var(--muted-foreground)]">Identity drives behavior.</p>
              <p className="text-xl text-[var(--muted-foreground)]">Structure creates clarity.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[var(--primary)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Ready to Build With MIRA?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Let&apos;s start the conversation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-[var(--primary)] hover:opacity-90 min-w-[180px]">
                  Enter Persona Engine
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10 min-w-[180px]"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
