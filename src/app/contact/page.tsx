'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Textarea } from '@/components/ui';
import { ROUTES } from '@/constants';
import { Send } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">
        {/* SECTION 1 — HERO HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Contact Real Juice Media</h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Questions about the MIRA Persona Engine, campaign activation, or partnerships.
          </p>
        </div>

        {/* SECTION 2 — CONTACT FORM */}
        <div className="space-y-5">
          {submitted ? (
            <div className="text-center p-8 rounded-lg border border-[var(--border)] bg-[var(--accent)]">
              <p className="font-medium">Message sent. We will be in touch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Name"
                placeholder=""
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Company"
                placeholder=""
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Textarea
                label="Message"
                placeholder=""
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
              />
              <Button type="submit" className="w-full" size="lg">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </form>
          )}
        </div>

        {/* SECTION 3 — DIRECT CONTACT */}
        <div className="text-center">
          <p className="text-[var(--muted-foreground)]">
            Direct inquiries:{' '}
            <a
              href="mailto:jesse@realjuicemedia.com"
              className="text-[var(--primary)] hover:underline"
            >
              jesse@realjuicemedia.com
            </a>
          </p>
        </div>

        {/* SECTION 4 — CTA */}
        <div className="text-center">
          <Link href={ROUTES.WORKSPACE}>
            <Button size="lg" className="px-8">
              Enter Persona Engine
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
