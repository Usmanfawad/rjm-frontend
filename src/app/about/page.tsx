import { Navbar, Footer } from '@/components/layout';
import { Card, CardContent, Button } from '@/components/ui';
import { Target, Lightbulb, Users, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const values = [
  {
    icon: Target,
    title: 'Precision',
    description: 'We deliver precise cultural insights backed by data and deep expertise.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We continuously evolve our methodologies to stay ahead of cultural trends.',
  },
  {
    icon: Users,
    title: 'Inclusivity',
    description: 'We celebrate diversity and help brands connect authentically with all audiences.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We hold ourselves to the highest standards in everything we create.',
  },
];

const stats = [
  { value: '300+', label: 'Core Personas' },
  { value: '13', label: 'Ad Categories' },
  { value: '22', label: 'Cultural Phyla' },
  { value: '125', label: 'Local Segments' },
];

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
                MIRA is a leading cultural intelligence platform that combines AI technology with
                deep cultural expertise to help brands connect with their audiences in meaningful ways.
              </p>
              <p className="text-[var(--muted-foreground)]">
                Our mission is to transform how brands understand and engage with diverse audiences
                by providing actionable persona insights and culturally-relevant activation strategies.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[var(--muted-foreground)]">{stat.label}</div>
                </div>
              ))}
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
                  MIRA was founded with a simple belief: great marketing starts with understanding
                  people. In a world of increasing diversity and cultural complexity, brands need
                  more than demographic data to truly connect with their audiences.
                </p>
                <p className="text-[var(--muted-foreground)] mb-4">
                  We developed the MIRA Ingredient Canon a comprehensive framework that maps
                  cultural behaviors, values, and preferences across multiple dimensions. This
                  proprietary methodology powers our AI platform, enabling brands to generate
                  nuanced persona programs in seconds.
                </p>
                <p className="text-[var(--muted-foreground)]">
                  Today, MIRA serves leading brands across industries, helping them create
                  campaigns that resonate with authenticity and cultural relevance.
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

        {/* Values */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <Card key={value.title} variant="elevated">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--primary)] flex items-center justify-center mb-4">
                      <value.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[var(--primary)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join us and discover the power of cultural intelligence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-[var(--primary)] hover:opacity-90 min-w-[180px]">
                  Get Started
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
