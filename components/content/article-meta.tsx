import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { siteConfig } from '@/lib/site.config';
import { Calendar, Clock, RotateCcw, UserCheck } from 'lucide-react';

interface ArticleMetaProps {
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
}

export function ArticleMeta({
  author = siteConfig.author.name,
  publishedAt,
  updatedAt,
  readingTime,
}: ArticleMetaProps) {
  const authorInitials = author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-foreground text-xs leading-none">
              {author}
            </p>
            <UserCheck className="h-3 w-3 text-primary" />
            <span className="text-[11px] text-muted-foreground font-normal">
              • {siteConfig.author.role}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Published <time dateTime={publishedAt}>{formatDate(publishedAt)}</time></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        {updatedAt && (
          <div className="flex items-center gap-1.5 text-foreground/80 font-medium" title="Last updated">
            <RotateCcw className="h-3.5 w-3.5 text-primary" />
            <span>Updated {formatDate(updatedAt)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{readingTime} min read</span>
        </div>
      </div>
    </div>
  );
}
