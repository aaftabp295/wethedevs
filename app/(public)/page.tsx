import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { contentTypes } from '@/lib/content/content-types.config';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-28 min-h-screen flex items-center">
        <Container className="text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            The editorial platform for{' '}
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              developers
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            In-depth alternatives, comparisons, reviews, and guides for the
            tools you use every day. No fluff. No affiliate spam. Just honest,
            well-researched content.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {contentTypes.slice(0, 4).map((ct) => (
              <Link
                key={ct.slug}
                href={`/${ct.slug}`}
                className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {ct.pluralLabel}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Content sections will be populated in Phase 3 */}
      <section className="border-t border-border py-16">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((ct) => (
              <Link
                key={ct.slug}
                href={`/${ct.slug}`}
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-foreground/20 hover:bg-accent/50"
              >
                <h2 className="text-lg font-semibold tracking-tight">
                  {ct.pluralLabel}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {ct.description}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-foreground group-hover:underline">
                  Browse {ct.pluralLabel.toLowerCase()} →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
