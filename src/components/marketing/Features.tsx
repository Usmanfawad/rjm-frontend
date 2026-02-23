'use client';

const capabilities = [
  {
    number: '01',
    title: 'Persona Intelligence',
    description: '300+ culturally-mapped personas across 13 advertising categories, selected and ranked by AI.',
  },
  {
    number: '02',
    title: 'Cultural Mapping',
    description: '22 cultural phyla and 6 multicultural expression lineages for identity-based targeting.',
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
    description: 'Structured persona frameworks tailored to your brand brief and campaign objectives.',
  },
  {
    number: '06',
    title: 'Activation Plans',
    description: 'Persona-driven deployment strategies with channel reasoning and media guidance.',
  },
];

export function Features() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* What MIRA Does */}
        <div className="mb-32 max-w-3xl">
          <h2 className="text-sm font-medium text-[var(--primary)] uppercase tracking-wider mb-4">
            What MIRA Persona Engine Does
          </h2>
          <p className="text-2xl sm:text-3xl font-bold leading-relaxed mb-6">
            MIRA Persona Engine translates brand inputs into structured, activation-ready persona frameworks.
          </p>
          <p className="text-lg text-[var(--muted-foreground)] mb-2">
            From brief to deployment in minutes.
          </p>
          <p className="text-lg text-[var(--muted-foreground)]">
            Built for brands, agencies, platforms, and data partners.
          </p>
        </div>

        {/* Capabilities */}
        <div className="border-t border-[var(--border)] pt-24">
          <h2 className="text-3xl sm:text-4xl font-bold mb-16">
            Capabilities
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((capability) => (
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
