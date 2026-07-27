import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ArticleBreadcrumbs } from './article-breadcrumbs';
import { ArticleMeta } from './article-meta';
import { ContentTypeSlug } from '@/types/content';

interface ArticleHeroProps {
  title: string;
  description: string;
  contentType: ContentTypeSlug;
  contentTypeLabel: string;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  author?: string;
  cover?: string;
  coverAlt?: string;
}

export function ArticleHero({
  title,
  description,
  contentType,
  contentTypeLabel,
  tags,
  publishedAt,
  updatedAt,
  readingTime,
  author,
  cover,
  coverAlt,
}: ArticleHeroProps) {
  return (
    <div className="space-y-6">
      <ArticleBreadcrumbs
        contentType={contentType}
        contentTypeLabel={contentTypeLabel}
        title={title}
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="capitalize">
            {contentTypeLabel}
          </Badge>
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-muted-foreground">
              #{tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-serif leading-tight">
          {title}
        </h1>

        <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl font-sans">
          {description}
        </p>
      </div>

      <ArticleMeta
        author={author}
        publishedAt={publishedAt}
        updatedAt={updatedAt}
        readingTime={readingTime}
      />

      {/* Feature Cover Image — Positioned for optimal SEO & Google E-E-A-T */}
      {cover && (
        <div className="pt-2">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-xs relative aspect-[16/9] w-full max-h-[480px]">
            <Image
              src={cover}
              alt={coverAlt || title}
              fill
              priority
              unoptimized
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
