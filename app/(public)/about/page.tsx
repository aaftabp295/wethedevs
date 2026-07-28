import { Container } from '@/components/layout/container';
import { siteConfig } from '@/lib/site.config';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Cpu, Code2, Sparkles, CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = constructMetadata({
  title: `About Us & Editorial Standards — ${siteConfig.name}`,
  description: `Learn how ${siteConfig.name} tests AI tools, coding assistants, and software alternatives with hands-on technical benchmarks and strict editorial independence.`,
  canonical: '/about',
  type: 'website',
});

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${siteConfig.name}`,
    description: siteConfig.description,
    url: `${siteConfig.url}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      founder: {
        '@type': 'Person',
        name: siteConfig.author.name,
        jobTitle: siteConfig.author.role,
        description: siteConfig.author.bio,
        sameAs: [siteConfig.links.github, siteConfig.links.twitter],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      {/* Hero Header */}
      <section className="border-b border-border bg-gradient-to-b from-background via-muted/10 to-background py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider">
              E-E-A-T & Editorial Transparency
            </Badge>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-serif text-foreground leading-tight">
              Engineering-First Reviews. Zero Clutter. Pure Data.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {siteConfig.name} is an independent editorial platform dedicated to helping developers, founders, and engineers evaluate modern AI coding tools, software alternatives, and development workflows.
            </p>
          </div>
        </Container>
      </section>

      {/* Editorial Methodology & Testing Standards */}
      <section className="py-16 border-b border-border">
        <Container>
          <div className="mx-auto max-w-4xl space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
                Our Testing Methodology & Standards
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                Google Search Quality Guidelines reward real experience and expertise. Here is exactly how we evaluate every tool before publishing.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3 shadow-xs">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Code2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">1. Hands-On Benchmarking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We don&apos;t summarize marketing landing pages. Every tool is installed, tested in production scenarios, and measured for real-world execution latency, output accuracy, and edge-case failures.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3 shadow-xs">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">2. Strict Editorial Independence</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No sponsored placements, no paid reviews, and no vendor overrides. Every ranking, pros/cons list, and recommendation is based purely on empirical test performance and value.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3 shadow-xs">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">3. Transparent Pricing & Lock-in Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We dissect subscription tiers, hidden token costs, enterprise seats, and code ownership/vendor lock-in risks so you know the full lifecycle cost before committing.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3 shadow-xs">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">4. Continuous Article Maintenance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Developer tools evolve weekly. We continuously audit our published guides to update pricing models, benchmark metrics, and deprecated API features to keep information 100% accurate.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Author & Editorial Leadership Section */}
      <section className="py-16 border-b border-border bg-muted/20">
        <Container>
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="h-20 w-20 rounded-full bg-foreground text-background flex items-center justify-center font-serif text-2xl font-bold shrink-0">
                A
              </div>
              <div className="space-y-1.5 flex-1">
                <Badge variant="outline" className="text-xs font-semibold">
                  Founder & Senior Editor
                </Badge>
                <h3 className="text-2xl font-bold font-serif">{siteConfig.author.name}</h3>
                <p className="text-xs font-mono text-muted-foreground">{siteConfig.author.role}</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {siteConfig.author.bio} With years of full-stack engineering experience, Aaftab tests AI coding agents, voice models, UI generators, and developer productivity suites to cut through industry hype.
            </p>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-4 text-muted-foreground">
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub Profile
                </a>
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter / X
                </a>
              </div>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Verified Author
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust & Correction Policy */}
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-serif tracking-tight">
                Fact-Checking & Corrections Policy
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Accuracy is paramount. If a vendor updates their pricing, deprecates a feature, or if you spot an oversight in any of our technical comparisons, please contact our editorial team. We review and issue transparent corrections within 24 hours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-xl border border-border bg-card">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Have feedback or a correction?</h4>
                <p className="text-xs text-muted-foreground">Reach out directly to our editorial team.</p>
              </div>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:bg-foreground/90 transition-colors shrink-0"
              >
                <Mail className="h-3.5 w-3.5" /> Contact Editorial
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
