import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { getContentType } from '@/lib/content/content-types.config';
import { getManifest } from '@/lib/content/manifest';
import { getRelatedArticles } from '@/lib/content/related';
import { ArticleHero } from '@/components/content/article-hero';
import { ArticleTOC } from '@/components/content/article-toc';
import { ArticleShare } from '@/components/content/article-share';
import { ArticleNav } from '@/components/content/article-nav';
import { RelatedArticles } from '@/components/content/related-articles';
import { SEOHead } from '@/components/shared/seo-head';
import { constructMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/site.config';
import { ContentTypeSlug } from '@/types/content';

interface ArticlePageProps {
  params: Promise<{ contentType: string; slug: string }>;
}

export async function generateStaticParams() {
  const manifest = getManifest();
  return manifest.articles.map((article) => ({
    contentType: article.contentType,
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { contentType, slug } = await params;
  const manifest = getManifest();
  const article = manifest.articles.find(
    (a) => a.contentType === contentType && a.slug === slug
  );

  if (!article) return {};

  return constructMetadata({
    title: article.title,
    description: article.description,
    canonical: `/${contentType}/${slug}`,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt || article.publishedAt,
    tags: article.tags,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { contentType, slug } = await params;
  const config = getContentType(contentType);

  if (!config) {
    notFound();
  }

  const manifest = getManifest();
  const article = manifest.articles.find(
    (a) => a.contentType === contentType && a.slug === slug
  );

  if (!article) {
    notFound();
  }

  // Dynamic import of the MDX article file
  let MDXContent: React.ComponentType;
  try {
    const mdxModule = await import(`@/content/${contentType}/${slug}/article.mdx`);
    MDXContent = mdxModule.default;
  } catch {
    notFound();
  }

  const related = getRelatedArticles(slug, manifest.articles);
  const articleUrl = `${siteConfig.url}/${contentType}/${slug}`;

  const articleJsonLd = buildArticleJsonLd(article, articleUrl);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: config.pluralLabel, url: `/${contentType}` },
    { name: article.title, url: `/${contentType}/${slug}` },
  ]);

  return (
    <>
      <SEOHead jsonLd={[articleJsonLd, breadcrumbJsonLd]} />

      <article className="py-12 sm:py-16">
        <Container>
          {/* Hero Header */}
          <div className="mx-auto max-w-3xl">
            <ArticleHero
              title={article.title}
              description={article.description}
              topic={article.topic}
              contentType={article.contentType as ContentTypeSlug}
              contentTypeLabel={config.label}
              tags={article.tags}
              publishedAt={article.publishedAt}
              updatedAt={article.updatedAt}
              readingTime={article.readingTime}
              author={siteConfig.author.name}
            />
          </div>

          {/* Main Layout: Article Body + Sticky TOC */}
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Sticky TOC (Desktop Sidebar) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20">
                <ArticleTOC headings={article.headings} />
              </div>
            </aside>

            {/* Article Content */}
            <div className="lg:col-span-9 max-w-none">
              <div className="prose prose-neutral dark:prose-invert max-w-reading leading-relaxed space-y-6">
                <MDXContent />
              </div>

              {/* Share */}
              <div className="mt-12">
                <ArticleShare title={article.title} url={articleUrl} />
              </div>

              {/* Related Articles */}
              <RelatedArticles articles={related} />

              {/* Navigation (Prev/Next) */}
              <ArticleNav />
            </div>
          </div>
        </Container>
      </article>
    </>
  );
}
