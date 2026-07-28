import { Container } from '@/components/layout/container';
import { siteConfig } from '@/lib/site.config';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { ShieldCheck, Lock, Eye, Database, Server, UserCheck } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `Learn how ${siteConfig.name} protects reader privacy with zero invasive cross-site tracking, privacy-focused infrastructure, and complete data transparency.`,
  canonical: '/privacy',
  type: 'website',
});

export default function PrivacyPage() {
  const privacySchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Privacy Policy — ${siteConfig.name}`,
    description: `Privacy policy and data protection disclosure for ${siteConfig.name}.`,
    url: `${siteConfig.url}/privacy`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
      />

      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Page Header */}
          <div className="space-y-4 border-b border-border pb-8">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-serif text-foreground">
              Privacy Policy
            </h1>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last updated: July 28, 2026</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-4 w-4" /> GDPR & CCPA Compliant
              </span>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Lock className="h-4 w-4 text-emerald-500" /> Zero Data Sales
              </div>
              <p className="text-xs text-muted-foreground">We never sell, rent, or trade personal reader data.</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Eye className="h-4 w-4 text-blue-500" /> No Cross-Site Trackers
              </div>
              <p className="text-xs text-muted-foreground">We do not use third-party advertising cookie networks.</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <UserCheck className="h-4 w-4 text-indigo-500" /> Full Control
              </div>
              <p className="text-xs text-muted-foreground">Access, export, or request deletion of your data anytime.</p>
            </div>
          </div>

          {/* Detailed Policy Document */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                1. Overview & Privacy Philosophy
              </h2>
              <p className="text-sm leading-relaxed">
                At <strong>{siteConfig.name}</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), accessible from {siteConfig.url}, reader trust and data privacy are core operating principles. This Privacy Policy details the types of information we collect, how it is processed, and the measures we enforce to protect your personal data in compliance with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                2. Information We Collect
              </h2>
              <p className="text-sm leading-relaxed">
                We operate under a data-minimization model, collecting only the minimum information necessary to deliver and secure our publication:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-2">
                <li>
                  <strong>Technical Log Data:</strong> Like standard web platforms, our infrastructure providers log basic technical requests (IP address, user-agent string, operating system type, and request timestamp) for security auditing, DDoS protection, and rate limiting.
                </li>
                <li>
                  <strong>Local Storage Preferences:</strong> Your visual theme choice (light mode, dark mode, or system default) is stored locally in your browser via <code className="text-xs bg-muted px-1.5 py-0.5 rounded">localStorage</code>. This data never leaves your device.
                </li>
                <li>
                  <strong>Email Subscription Data:</strong> If you voluntarily subscribe to our developer newsletter, we store your email address solely for newsletter delivery. You can opt-out at any time via the one-click unsubscribe link in any email.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                3. Privacy-First Analytics
              </h2>
              <p className="text-sm leading-relaxed">
                We use privacy-focused performance analytics (Cloudflare Web Analytics) to measure aggregate readership metrics (such as daily pageviews, popular articles, and performance load speeds). These analytics operate without invasive tracking cookies, persistent cross-site profile building, or fingerprinting.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                4. Infrastructure & Third-Party Service Providers
              </h2>
              <p className="text-sm leading-relaxed">
                Our platform relies on enterprise-grade infrastructure providers bound by strict data processing agreements:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="p-3 rounded-lg border border-border/60 bg-card/50 text-xs space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5" /> Vercel Inc.
                  </span>
                  <p className="text-muted-foreground">Hosting, static edge content delivery, and serverless runtime execution.</p>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-card/50 text-xs space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5" /> Supabase Inc.
                  </span>
                  <p className="text-muted-foreground">Encrypted cloud database storage for uploaded article media assets.</p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                5. Your Data Protection Rights (GDPR & CCPA)
              </h2>
              <p className="text-sm leading-relaxed">
                Regardless of your geographic location, we extend full data sovereignty rights to all readers:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-2">
                <li><strong>Right to Access:</strong> You can request a copy of any personal data we hold about you.</li>
                <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can request that we delete your email address from our subscriber lists.</li>
                <li><strong>Right to Opt-Out:</strong> You can decline marketing communications at any time.</li>
                <li><strong>Non-Discrimination:</strong> We will never discriminate against you for exercising your privacy rights.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                6. Contact Information
              </h2>
              <p className="text-sm leading-relaxed">
                If you have questions, data access requests, or privacy concerns regarding this policy, please reach out to our team at:
              </p>
              <div className="p-4 rounded-xl border border-border bg-card text-xs space-y-1">
                <p className="font-semibold text-foreground">{siteConfig.name} Data Privacy Team</p>
                <p className="text-muted-foreground">Email: privacy@wethedevs.vercel.app</p>
                <p className="text-muted-foreground">Website: {siteConfig.url}</p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
