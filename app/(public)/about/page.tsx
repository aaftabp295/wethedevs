import { Container } from '@/components/layout/container';
import { siteConfig } from '@/lib/site.config';
import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'About',
  description: `Learn more about ${siteConfig.name} and our editorial mission.`,
  canonical: '/about',
  type: 'website',
});

export default function AboutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-serif">
            About {siteConfig.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {siteConfig.name} is a Git-backed, high-performance publishing platform focused exclusively on developer tools, AI coding workflows, and software architecture.
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-bold text-foreground">Our Editorial Mission</h2>
          <p>
            We believe developer editorial content should be calm, fast, beautiful, and authentic. No fluff. No clickbait titles. No sponsored bias. Just rigorous hands-on benchmarks, architecture deep dives, and honest tool reviews.
          </p>

          <h2 className="text-xl font-bold text-foreground">Architecture Principles</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Git-Backed Engine:</strong> All content is stored in Git, versioned cleanly, and rendered statically at the edge.</li>
            <li><strong>Zero Maintenance:</strong> Built on static generation to ensure 100% uptime and minimal infrastructure footprint.</li>
            <li><strong>Typography First:</strong> Designed for focused, distraction-free reading.</li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
