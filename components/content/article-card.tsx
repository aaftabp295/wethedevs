import Link from 'next/link';
import Image from 'next/image';
import { ManifestEntry } from '@/types/content';
import { formatDateShort } from '@/lib/utils';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

type CardVariant = 'default' | 'compact' | 'hero';

interface ArticleCardProps {
  article: ManifestEntry;
  variant?: CardVariant;
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const href = `/${article.contentType}/${article.slug}`;

  /* ── Hero: split layout — text left, image right ── */
  if (variant === 'hero') {
    return (
      <Link href={href} className="group block w-full">
        <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 items-center">
          {/* Left: Text content on clean background */}
          <div className="space-y-4 sm:space-y-5 order-2 lg:order-1 py-2">
            <span className="topic-badge topic-badge-default">
              {article.topic}
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold font-serif tracking-tight leading-[1.15] text-foreground">
              {article.title}
            </h2>

            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground line-clamp-3 max-w-lg">
              {article.description}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={article.publishedAt}>
                  {formatDateShort(article.publishedAt)}
                </time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {article.readingTime} min read
              </span>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                Read article
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </span>
            </div>
          </div>

          {/* Right: Cover image */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl lg:rounded-2xl bg-muted order-1 lg:order-2">
            {article.cover ? (
              <Image
                src={article.cover}
                alt={article.coverAlt || article.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover card-image-zoom"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
            )}
          </div>
        </div>
      </Link>
    );
  }

  /* ── Compact: headline-only, no image ── */
  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="group relative block pl-5 py-4 transition-colors hover:bg-muted/30 rounded-lg"
      >
        <div className="compact-accent-bar" />
        <div className="space-y-1.5">
          <span className="topic-badge topic-badge-default text-[0.625rem]">
            {article.topic}
          </span>
          <h3 className="text-base font-semibold tracking-tight leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readingTime} min
            </span>
            <time dateTime={article.publishedAt} className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateShort(article.publishedAt)}
            </time>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Default: image + text card ── */
  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card card-hover-lift">
      {/* Cover image */}
      {article.cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          <Image
            src={article.cover}
            alt={article.coverAlt || article.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover card-image-zoom"
          />
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="topic-badge topic-badge-default">
            {article.topic}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 font-serif">
          {article.title}
        </h3>

        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 flex-1">
          {article.description}
        </p>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={article.publishedAt}>
              {formatDateShort(article.publishedAt)}
            </time>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{article.readingTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
