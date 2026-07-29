import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { siteConfig } from '@/lib/site.config';
import { constructMetadata } from '@/lib/seo/metadata';
import { getPublicArticles } from '@/lib/content/manifest';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, BookOpen, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [{ slug: 'aaftab' }];
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== 'aaftab') return {};

  return constructMetadata({
    title: `${siteConfig.author.name} — Author Profile & Technical Reviews`,
    description: `${siteConfig.author.name} is a ${siteConfig.author.role} writing in-depth benchmarks and technical comparisons on AI coding tools and voice generators.`,
    canonical: `/author/${slug}`,
    type: 'website',
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;

  if (slug !== 'aaftab') {
    notFound();
  }

  const articles = getPublicArticles();

  const authorSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.author.name,
    jobTitle: siteConfig.author.role,
    description: siteConfig.author.bio,
    url: `${siteConfig.url}/author/${slug}`,
    worksFor: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    sameAs: [siteConfig.links.github, siteConfig.links.twitter].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
      />

      {/* Hero Header / Author Bio Card */}
      <section className="border-b border-border bg-gradient-to-b from-background via-muted/10 to-background py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
              <div className="h-28 w-28 rounded-2xl bg-foreground text-background flex items-center justify-center font-serif text-4xl font-bold shadow-md shrink-0">
                A
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <Badge variant="secondary" className="px-3 py-0.5 text-xs font-semibold uppercase tracking-wider">
                    Senior Tech Reviewer
                  </Badge>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified Author
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-foreground">
                  {siteConfig.author.name}
                </h1>

                <p className="text-sm font-mono text-muted-foreground">
                  {siteConfig.author.role}
                </p>

                <p className="text-base text-muted-foreground leading-relaxed pt-2">
                  {siteConfig.author.bio} Specializing in empirical latency testing, API architecture comparisons, pricing breakdown analysis, and hands-on developer tool evaluations.
                </p>

                <div className="pt-4 flex items-center justify-center sm:justify-start gap-6 text-sm text-muted-foreground">
                  {siteConfig.links.github && (
                    <a
                      href={siteConfig.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      GitHub Profile
                    </a>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" /> 100% Independent Reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Articles Authored Section */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl space-y-10">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-2xl font-bold font-serif tracking-tight">
                  Articles & Guides Authored
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  In-depth comparisons, technical benchmarks, and alternative breakdowns written by {siteConfig.author.name}.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {articles.length} Published
              </Badge>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/${article.contentType}/${article.slug}`}
                  className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-primary uppercase tracking-wider text-[11px]">
                        {article.contentType}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" /> {article.readingTime} min read
                      </span>
                    </div>

                    <h3 className="text-lg font-bold font-serif text-foreground group-hover:text-primary transition-colors leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {article.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium text-primary">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" /> Read Full Guide
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
