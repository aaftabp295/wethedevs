import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ManifestEntry } from '@/types/content';
import { formatDateShort } from '@/lib/utils';
import { Clock, Calendar } from 'lucide-react';

interface ArticleCardProps {
  article: ManifestEntry;
  featured?: boolean;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:border-foreground/20 hover:shadow-md">
      <CardHeader className="space-y-2.5 p-6">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="capitalize font-normal text-xs">
            {article.contentType}
          </Badge>
          <span className="text-xs text-muted-foreground">{article.topic}</span>
        </div>
        <CardTitle className="line-clamp-2 text-xl font-bold tracking-tight group-hover:text-primary">
          <Link href={`/${article.contentType}/${article.slug}`}>
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between border-t border-border px-6 py-4 text-xs text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}
