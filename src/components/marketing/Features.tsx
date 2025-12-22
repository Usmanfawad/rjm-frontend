'use client';

import { Card, CardContent } from '@/components/ui';

const features = [
  {
    title: 'Mission',
    description:
      'Amplify authentic voices and transform how brands connect with diverse communities through culturally-intelligent personas.',
  },
  {
    title: 'Genesis',
    description:
      'Born from a vision to bridge cultural understanding and marketing strategy, MIRA represents the evolution of audience intelligence.',
  },
  {
    title: 'Vision',
    description:
      'A future where every brand message resonates authentically, powered by deep cultural insights and AI-driven persona generation.',
  },
];

const capabilities = [
  {
    number: '01',
    title: 'Persona Intelligence',
    description: 'Access 300+ culturally-mapped personas across 13 advertising categories.',
  },
  {
    number: '02',
    title: 'Cultural Mapping',
    description: '22 cultural phyla and 6 multicultural expression lineages for authentic targeting.',
  },
  {
    number: '03',
    title: 'Generational Insights',
    description: '32 generational segments spanning Gen Z to Boomers with behavioral mapping.',
  },
  {
    number: '04',
    title: 'Local Strategy',
    description: '125 DMA local culture segments for geographic and regional nuance.',
  },
  {
    number: '05',
    title: 'AI Generation',
    description: 'Instant persona programs tailored to your brand brief and campaign objectives.',
  },
  {
    number: '06',
    title: 'Activation Plans',
    description: 'Strategic recommendations with cultural touchpoints and media guidance.',
  },
];

export function Features() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-sm font-medium text-[var(--primary)] uppercase tracking-wider mb-4">
                {feature.title}
              </h3>
              <p className="text-lg leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Capabilities */}
        <div className="border-t border-[var(--border)] pt-24">
          <h2 className="text-3xl sm:text-4xl font-bold mb-16">
            Capabilities
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <div
                key={capability.number}
                className="group hover-lift p-6 border border-[var(--border)] rounded-lg transition-all hover:border-[var(--primary)]"
              >
                <span className="text-sm font-mono text-[var(--primary)] mb-4 block">
                  {capability.number}
                </span>
                <h3 className="text-xl font-semibold mb-3">
                  {capability.title}
                </h3>
                <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
