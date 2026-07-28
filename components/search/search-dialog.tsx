'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { getPublicArticles } from '@/lib/content/manifest';
import { contentTypes } from '@/lib/content/content-types.config';
import { ManifestEntry, ArticleHeading } from '@/types/content';
import { Search, FileText, Hash, Clock, Folder, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeadingMatch {
  article: ManifestEntry;
  heading: ArticleHeading;
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  const publicArticles = React.useMemo(() => getPublicArticles(), []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    setQuery('');
    command();
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  // Filter matching articles
  const matchingArticles = React.useMemo<ManifestEntry[]>(() => {
    if (!cleanQuery) return publicArticles;
    return publicArticles.filter((article) => {
      return (
        article.title.toLowerCase().includes(cleanQuery) ||
        article.description.toLowerCase().includes(cleanQuery) ||
        article.topic.toLowerCase().includes(cleanQuery) ||
        article.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      );
    });
  }, [cleanQuery, publicArticles]);

  // Filter matching section headings
  const matchingHeadings = React.useMemo<HeadingMatch[]>(() => {
    if (!cleanQuery) return [];
    const list: HeadingMatch[] = [];
    for (const article of publicArticles) {
      for (const heading of article.headings) {
        if (heading.text.toLowerCase().includes(cleanQuery)) {
          list.push({ article, heading });
        }
      }
    }
    return list;
  }, [cleanQuery, publicArticles]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:w-36 sm:px-3 sm:justify-between shrink-0"
        title="Search Content (Ctrl+K)"
      >
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search...</span>
        </span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex shrink-0">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search articles or tools..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[360px] overflow-y-auto p-2">
          <CommandEmpty className="py-8 text-center text-sm text-muted-foreground">
            No matching articles found for &quot;{query}&quot;.
          </CommandEmpty>

          {/* Section 1: Matching Articles (Single line, sleek Raycast layout) */}
          {matchingArticles.length > 0 && (
            <CommandGroup heading={cleanQuery ? "Matching Articles" : "Published Articles"}>
              {matchingArticles.map((article) => (
                <CommandItem
                  key={article.slug}
                  value={`${article.title} ${article.topic} ${article.tags.join(' ')}`}
                  onSelect={() => {
                    runCommand(() => router.push(`/${article.contentType}/${article.slug}`));
                  }}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-sm text-foreground truncate">
                      {article.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold px-2 py-0.5">
                      {article.topic}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {article.readingTime}m
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Section 2: Specific Section Headings */}
          {cleanQuery && matchingHeadings.length > 0 && (
            <CommandGroup heading="Matching Sections">
              {matchingHeadings.map(({ article, heading }) => (
                <CommandItem
                  key={`${article.slug}-${heading.id}`}
                  value={`${heading.text} ${article.title}`}
                  onSelect={() => {
                    runCommand(() =>
                      router.push(`/${article.contentType}/${article.slug}#${heading.id}`)
                    );
                  }}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {heading.text}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate shrink-0">
                    in {article.title.split('—')[0]}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Section 3: Browse Categories (ONLY shown when search query is empty) */}
          {!cleanQuery && (
            <CommandGroup heading="Browse Categories">
              {contentTypes.map((ct) => (
                <CommandItem
                  key={ct.slug}
                  value={ct.pluralLabel}
                  onSelect={() => {
                    runCommand(() => router.push(`/${ct.slug}`));
                  }}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{ct.pluralLabel}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
