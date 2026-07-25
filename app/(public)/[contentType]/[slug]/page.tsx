import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { getContentType } from '@/lib/content/content-types.config';
import { ArticleHero } from '@/components/content/article-hero';
import { ArticleTOC } from '@/components/content/article-toc';
import { ArticleShare } from '@/components/content/article-share';
import { ArticleNav } from '@/components/content/article-nav';
import { SEOHead } from '@/components/shared/seo-head';
import { constructMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/site.config';
import { ContentTypeSlug } from '@/types/content';

interface ArticlePageProps {
  params: Promise<{ contentType: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { contentType, slug } = await params;
  const config = getContentType(contentType);

  if (!config) return {};

  // Mock metadata placeholder until Phase 4 MDX loader
  const title = `${slug.replace(/-/g, ' ')} ${config.label}`;
  const description = `In-depth ${config.label.toLowerCase()} covering features, performance, and benchmarks.`;

  return constructMetadata({
    title,
    description,
    canonical: `/${contentType}/${slug}`,
    type: 'article',
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { contentType, slug } = await params;
  const config = getContentType(contentType);

  if (!config) {
    notFound();
  }

  // Placeholder article data until Phase 4 MDX loader
  const mockArticle = {
    title: slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    description: `Comprehensive analysis and breakdown of ${slug.replace(/-/g, ' ')}.`,
    slug,
    contentType: contentType as ContentTypeSlug,
    topic: 'Developer Tools',
    tags: [slug, 'dev-tools', 'coding'],
    publishedAt: new Date().toISOString(),
    readingTime: 5,
    author: siteConfig.author.name,
    headings: [
      { id: 'overview', text: 'Overview', level: 2 as const },
      { id: 'key-features', text: 'Key Features', level: 2 as const },
      { id: 'performance', text: 'Performance & Benchmarks', level: 2 as const },
      { id: 'verdict', text: 'Final Verdict', level: 2 as const },
    ],
  };

  const articleUrl = `${siteConfig.url}/${contentType}/${slug}`;

  const articleJsonLd = buildArticleJsonLd(
    {
      ...mockArticle,
      outgoingLinks: [],
      featured: false,
    },
    articleUrl
  );

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: config.pluralLabel, url: `/${contentType}` },
    { name: mockArticle.title, url: `/${contentType}/${slug}` },
  ]);

  return (
    <>
      <SEOHead jsonLd={[articleJsonLd, breadcrumbJsonLd]} />

      <article className="py-12 sm:py-16">
        <Container>
          {/* Hero Header */}
          <div className="mx-auto max-w-3xl">
            <ArticleHero
              title={mockArticle.title}
              description={mockArticle.description}
              topic={mockArticle.topic}
              contentType={mockArticle.contentType}
              contentTypeLabel={config.label}
              tags={mockArticle.tags}
              publishedAt={mockArticle.publishedAt}
              readingTime={mockArticle.readingTime}
              author={mockArticle.author}
            />
          </div>

          {/* Main Layout: Article Body + Sticky TOC */}
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Sticky TOC (Desktop Sidebar) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20">
                <ArticleTOC headings={mockArticle.headings} />
              </div>
            </aside>

            {/* Article Content */}
            <div className="lg:col-span-9 max-w-none">
              <div className="prose prose-neutral dark:prose-invert max-w-reading leading-relaxed space-y-6">
                <h2 id="overview" className="text-2xl font-bold tracking-tight">
                  Overview
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  This article provides a structured breakdown of {mockArticle.title}. Designed with editorial rigor, every comparison and benchmark is sourced directly from hands-on testing.
                </p>

                <h2 id="key-features" className="text-2xl font-bold tracking-tight">
                  Key Features
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Evaluating architecture, extension ecosystems, context length management, and latency across real-world workloads.
                </p>

                <h2 id="performance" className="text-2xl font-bold tracking-tight">
                  Performance & Benchmarks
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Clean code generation speed, memory footprints, and token utilization efficiency under pressure.
                </p>

                <h2 id="verdict" className="text-2xl font-bold tracking-tight">
                  Final Verdict
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Summary of strengths, trade-offs, and target developer profiles.
                </p>
              </div>

              {/* Share */}
              <div className="mt-12">
                <ArticleShare title={mockArticle.title} url={articleUrl} />
              </div>

              {/* Navigation (Prev/Next) */}
              <ArticleNav />
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}
