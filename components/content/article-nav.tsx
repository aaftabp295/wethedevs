import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArticleNavProps {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export function ArticleNav({ prev, next }: ArticleNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      className="grid gap-4 sm:grid-cols-2 border-t border-border pt-8 mt-12"
      aria-label="Previous and next article"
    >
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 rounded-lg border border-border p-4 transition-colors hover:border-foreground/20 hover:bg-accent/50"
        >
          <span className="inline-flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
          </span>
          <span className="line-clamp-1 text-sm font-semibold tracking-tight">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-lg border border-border p-4 text-right transition-colors hover:border-foreground/20 hover:bg-accent/50"
        >
          <span className="inline-flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
            Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </span>
          <span className="line-clamp-1 text-sm font-semibold tracking-tight">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
