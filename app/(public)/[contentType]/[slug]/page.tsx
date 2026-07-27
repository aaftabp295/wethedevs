import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { getContentType } from '@/lib/content/content-types.config';
import { getPublicArticles } from '@/lib/content/manifest';
import { getArticleBySlug, articleToManifestEntry } from '@/lib/content/loader';
import { getRelatedArticles } from '@/lib/content/related';
import { ArticleHero } from '@/components/content/article-hero';
import { ArticleTOC } from '@/components/content/article-toc';
import { ArticleShare } from '@/components/content/article-share';
import { ArticleNav } from '@/components/content/article-nav';
import { RelatedArticles } from '@/components/content/related-articles';
import { SEOHead } from '@/components/shared/seo-head';
import { constructMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd, buildFaqJsonLdFromContent } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/site.config';
import { ContentTypeSlug } from '@/types/content';

interface ArticlePageProps {
  params: Promise<{ contentType: string; slug: string }>;
}

export async function generateStaticParams() {
  const publicArticles = getPublicArticles();
  return publicArticles.map((article) => ({
    contentType: article.contentType,
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { contentType, slug } = await params;
  const article = getArticleBySlug(contentType, slug);

  if (!article || Boolean(article.draft)) return {};

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

  const article = getArticleBySlug(contentType, slug);

  if (!article || article.draft === true) {
    notFound();
  }

  // Dynamic import of the MDX article file
  let MDXContent: React.ComponentType;
  let mdxFrontmatter: Record<string, unknown> | undefined;
  try {
    const mdxModule = await import(`@/content/${contentType}/${slug}/article.mdx`);
    MDXContent = mdxModule.default;
    mdxFrontmatter = mdxModule.frontmatter || mdxModule.meta;
  } catch {
    notFound();
  }

  if (!article || Boolean(article.draft) || Boolean(mdxFrontmatter?.draft)) {
    notFound();
  }

  const publicArticles = getPublicArticles();
  const related = getRelatedArticles(slug, publicArticles);
  const articleUrl = `${siteConfig.url}/${contentType}/${slug}`;

  const manifestEntry = articleToManifestEntry(article);
  const articleJsonLd = buildArticleJsonLd(manifestEntry, articleUrl);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: config.pluralLabel, url: `/${contentType}` },
    { name: article.title, url: `/${contentType}/${slug}` },
  ]);
  const faqJsonLd = buildFaqJsonLdFromContent(article.content);

  const jsonLdPayload = [articleJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean) as Record<string, unknown>[];

  return (
    <>
      <SEOHead jsonLd={jsonLdPayload} />

      <article className="py-12 sm:py-16">
        <Container>
          {/* Hero Header */}
          <div className="mx-auto max-w-3xl">
            <ArticleHero
              title={article.title}
              description={article.description}
              contentType={article.contentType as ContentTypeSlug}
              contentTypeLabel={config.label}
              tags={article.tags}
              publishedAt={article.publishedAt}
              updatedAt={article.updatedAt}
              readingTime={article.readingTime}
              author={siteConfig.author.name}
              cover={article.cover}
              coverAlt={article.coverAlt}
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
