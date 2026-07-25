import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, RotateCcw } from 'lucide-react';

interface ArticleMetaProps {
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
}

export function ArticleMeta({
  author = 'Aaftab',
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
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground text-xs leading-none">
            {author}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        {updatedAt && (
          <div className="flex items-center gap-1.5" title="Last updated">
            <RotateCcw className="h-3.5 w-3.5" />
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
