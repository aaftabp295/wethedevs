import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { contentTypes } from '@/lib/content/content-types.config';
import { getPublicArticles } from '@/lib/content/manifest';
import { ArticleCard } from '@/components/content/article-card';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';

export default function HomePage() {
  const publicArticles = getPublicArticles();

  // Sort by publishedAt descending — most recent first
  const sorted = [...publicArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const heroArticle = sorted[0] ?? null;
  const gridArticles = sorted.slice(1, 3);   // next 2 for image cards
  const compactArticles = sorted.slice(3, 6); // next 3 for compact list

  return (
    <>
      {/* ── Section 1: Hero Feature ── */}
      {heroArticle && (
        <section className="border-b border-border">
          <Container className="py-4 sm:py-6">
            <ArticleCard article={heroArticle} variant="hero" />
          </Container>
        </section>
      )}

      {/* ── Section 2: Editorial Grid ── */}
      {(gridArticles.length > 0 || compactArticles.length > 0) && (
        <section className="py-12 sm:py-16 border-b border-border">
          <Container>
            {/* Section header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-foreground/30" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Latest
                </h2>
              </div>
              {publicArticles.length > 3 && (
                <Link
                  href="/alternatives"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
              {/* Left column: image cards (2/3 width) */}
              {gridArticles.length > 0 && (
                <div className={`space-y-6 ${compactArticles.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {gridArticles.map((article) => (
                      <ArticleCard key={article.slug} article={article} variant="default" />
                    ))}
                  </div>
                </div>
              )}

              {/* Right column: compact headline list (1/3 width) */}
              {compactArticles.length > 0 && (
                <div className={`${gridArticles.length > 0 ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
                  <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
                      More stories
                    </h3>
                    <div className="divide-y divide-border/60">
                      {compactArticles.map((article) => (
                        <ArticleCard key={article.slug} article={article} variant="compact" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── Section 3: Category Navigation ── */}
      <section className="py-12 sm:py-16 border-b border-border">
        <Container>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-foreground/30" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Explore
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((ct) => {
              const count = publicArticles.filter(
                (a) => a.contentType === ct.slug
              ).length;

              return (
                <Link
                  key={ct.slug}
                  href={`/${ct.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6 card-hover-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                        {ct.pluralLabel}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {ct.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {count}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-foreground/70 group-hover:text-foreground transition-colors">
                    Browse {ct.pluralLabel.toLowerCase()}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── Section 4: Newsletter CTA ── */}
      <section className="py-16 sm:py-20 newsletter-gradient">
        <Container className="text-center">
          <div className="mx-auto max-w-lg space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5 border border-border">
              <Sparkles className="h-5 w-5 text-foreground/60" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif">
              Developer insights, delivered
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Honest reviews, real comparisons, and actionable guides for the tools you use every day. No spam, no fluff.
            </p>

            {/* Email form placeholder — wire to your newsletter provider */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pl-10 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="button"
                className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90 transition-colors shrink-0"
              >
                Subscribe
              </button>
            </div>

            <p className="text-xs text-muted-foreground/60">
              Free forever. Unsubscribe anytime.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
