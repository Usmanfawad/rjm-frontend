export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        {/* SECTION 1 — PAGE HEADER */}
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>

        {/* SECTION 2 — PAGE BODY */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Real Juice Media Terms of Service</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            For questions regarding terms, licensing, or platform use related to the MIRA Persona
            Engine contact:
          </p>
          <p>
            <a
              href="mailto:jesse@realjuicemedia.com"
              className="text-[var(--primary)] hover:underline"
            >
              jesse@realjuicemedia.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
