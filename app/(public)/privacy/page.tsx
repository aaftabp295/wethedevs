import { Container } from '@/components/layout/container';
import { siteConfig } from '@/lib/site.config';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy',
  description: `Privacy policy and data transparency for ${siteConfig.name}.`,
  canonical: '/privacy',
  type: 'website',
});

export default function PrivacyPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-serif">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: July 25, 2026
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-bold text-foreground">1. Privacy Commitment</h2>
          <p>
            At {siteConfig.name}, we prioritize privacy and simplicity. We do not track personal identification info, sell user data, or use invasive cross-site tracking cookies.
          </p>

          <h2 className="text-xl font-bold text-foreground">2. Analytics</h2>
          <p>
            We use lightweight, privacy-focused analytics (Cloudflare Web Analytics) to measure aggregate pageviews and technical performance. No personal tracking cookies or persistent IP logging are used.
          </p>

          <h2 className="text-xl font-bold text-foreground">3. Local Preferences</h2>
          <p>
            Your visual preference (light mode / dark mode / system) is saved locally in your browser (via localStorage) to preserve your reading experience.
          </p>
        </div>
      </div>
    </Container>
  );
}
