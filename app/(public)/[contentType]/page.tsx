import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { getContentType, contentTypeSlugs } from '@/lib/content/content-types.config';
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

  // Articles will be dynamically fetched from content-index.json in Phase 4
  const articles: [] = [];

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
            {/* Render ArticleCard list here in Phase 4 */}
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
