import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { contentTypes } from '@/lib/content/content-types.config';
import { getManifest } from '@/lib/content/manifest';
import { ArticleCard } from '@/components/content/article-card';

export default function HomePage() {
  const manifest = getManifest();
  const featuredArticles = manifest.articles.filter((a) => a.featured);
  const recentArticles = manifest.articles.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-28 border-b border-border bg-gradient-to-b from-background to-muted/20">
        <Container className="text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-serif">
            The editorial platform for{' '}
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              developers
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            In-depth alternatives, comparisons, reviews, and guides for the
            tools you use every day. Zero clutter. Pure developer insights.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {contentTypes.map((ct) => (
              <Link
                key={ct.slug}
                href={`/${ct.slug}`}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground shadow-xs"
              >
                {ct.pluralLabel}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Articles Section */}
      {featuredArticles.length > 0 && (
        <section className="py-16 border-b border-border">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">
                Featured Articles
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Recent Articles Section */}
      {recentArticles.length > 0 && (
        <section className="py-16 border-b border-border bg-muted/10">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">
                Latest Publications
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Category Grid Section */}
      <section className="py-16">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Explore Content Categories
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contentTypes.map((ct) => {
              const count = manifest.articles.filter(
                (a) => a.contentType === ct.slug
              ).length;

              return (
                <Link
                  key={ct.slug}
                  href={`/${ct.slug}`}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">
                      {ct.pluralLabel}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {count} {count === 1 ? 'article' : 'articles'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {ct.description}
                  </p>
                  <span className="mt-4 inline-block text-xs font-semibold text-foreground group-hover:underline">
                    Browse {ct.pluralLabel.toLowerCase()} →
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
