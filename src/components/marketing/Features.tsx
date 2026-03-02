'use client';

const capabilities = [
  {
    number: '01',
    title: 'Audience Architecture',
    description: 'Identity-based persona frameworks rooted in real cultural behavior.',
  },
  {
    number: '02',
    title: 'Strategic Segmentation',
    description: 'Clear audience structures aligned to brand objectives and category logic.',
  },
  {
    number: '03',
    title: 'Generational and Cultural Overlays',
    description: 'Contextual refinement across cohorts and multicultural initiatives.',
  },
  {
    number: '04',
    title: 'Local Intelligence',
    description: 'DMA-level cultural nuance for geographically targeted campaigns.',
  },
  {
    number: '05',
    title: 'Framework Generation',
    description: 'Structured persona programs built from brand briefs and campaign goals.',
  },
  {
    number: '06',
    title: 'Activation Pathways',
    description: 'Persona-driven deployment strategies across your existing media ecosystem.',
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
            MIRA Persona Engine turns brand inputs into structured, activation-ready persona frameworks.
          </p>
          <p className="text-lg text-[var(--muted-foreground)] mb-2">
            From brief to deployment in minutes.
          </p>
          <p className="text-lg text-[var(--muted-foreground)]">
            Built for brands, agencies, platforms, publishers, and data partners.
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
