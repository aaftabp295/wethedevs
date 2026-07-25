import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { getContentType, contentTypeSlugs } from '@/lib/content/content-types.config';
import { getManifest } from '@/lib/content/manifest';
import { ArticleCard } from '@/components/content/article-card';
import { EmptyState } from '@/components/content/empty-state';
import { constructMetadata } from '@/lib/seo/metadata';

interface ListingPageProps {
  params: Promise<{ contentType: string }>;
}

export async function generateStaticParams() {
  return contentTypeSlugs.map((slug) => ({
    contentType: slug,
  }));
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { contentType } = await params;
  const config = getContentType(contentType);

  if (!config) return {};

  return constructMetadata({
    title: config.pluralLabel,
    description: config.description,
    canonical: `/${config.slug}`,
    type: 'website',
  });
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { contentType } = await params;
  const config = getContentType(contentType);

  if (!config) {
    notFound();
  }

  const manifest = getManifest();
  const articles = manifest.articles.filter(
    (article) => article.contentType === contentType
  );

  return (
    <Container className="py-12 sm:py-16">
      {/* Header */}
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {config.pluralLabel}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          {config.description}
        </p>
      </div>

      {/* Content Grid / Empty State */}
      <div className="mt-10">
        {articles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No ${config.pluralLabel.toLowerCase()} published yet`}
            description={`Articles in ${config.pluralLabel} will appear here once published.`}
            actionLabel="Return Home"
            actionHref="/"
          />
        )}
      </div>
    </Container>
  );
}
