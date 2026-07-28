'use client';

import * as React from 'react';
import { Container } from '@/components/layout/container';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { contentTypes } from '@/lib/content/content-types.config';
import { getPublicArticles } from '@/lib/content/manifest';
import { ArticleCard } from '@/components/content/article-card';
import { ManifestEntry, ArticleHeading } from '@/types/content';
import { Search as SearchIcon, FileText, Hash, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface HeadingMatch {
  article: ManifestEntry;
  heading: ArticleHeading;
}

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  const publicArticles = React.useMemo(() => getPublicArticles(), []);

  const cleanQuery = query.trim().toLowerCase();

  // Real-time filtering across titles, descriptions, topics, and tags
  const filteredArticles = React.useMemo<ManifestEntry[]>(() => {
    let list = publicArticles;
    if (selectedType) {
      list = list.filter((a) => a.contentType === selectedType);
    }

    if (!cleanQuery) return list;

    return list.filter((article) => {
      return (
        article.title.toLowerCase().includes(cleanQuery) ||
        article.description.toLowerCase().includes(cleanQuery) ||
        article.topic.toLowerCase().includes(cleanQuery) ||
        article.tags.some((t) => t.toLowerCase().includes(cleanQuery))
      );
    });
  }, [cleanQuery, selectedType, publicArticles]);

  // Real-time filtering across section headings
  const matchedHeadings = React.useMemo<HeadingMatch[]>(() => {
    if (!cleanQuery) return [];
    let list = publicArticles;
    if (selectedType) {
      list = list.filter((a) => a.contentType === selectedType);
    }

    const matches: HeadingMatch[] = [];
    for (const article of list) {
      for (const heading of article.headings) {
        if (heading.text.toLowerCase().includes(cleanQuery)) {
          matches.push({ article, heading });
        }
      }
    }
    return matches;
  }, [cleanQuery, selectedType, publicArticles]);

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-serif">
          Search Articles & Tools
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Find alternatives, comparisons, guides, and reviews across all developer topics.
        </p>

        {/* Input */}
        <div className="relative mt-6">
          <SearchIcon className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by tool (e.g. Canva, Cursor, ElevenLabs), topic, or section..."
            className="pl-11 h-12 text-base shadow-xs rounded-xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Content Type Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Badge
            variant={selectedType === null ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-1 text-xs"
            onClick={() => setSelectedType(null)}
          >
            All Types
          </Badge>
          {contentTypes.map((ct) => (
            <Badge
              key={ct.slug}
              variant={selectedType === ct.slug ? 'default' : 'outline'}
              className="cursor-pointer capitalize px-3 py-1 text-xs"
              onClick={() =>
                setSelectedType(selectedType === ct.slug ? null : ct.slug)
              }
            >
              {ct.pluralLabel}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-12 mx-auto max-w-4xl border-t border-border pt-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {query
              ? `Results for "${query}" (${filteredArticles.length} articles, ${matchedHeadings.length} section matches)`
              : selectedType
              ? `Articles in ${contentTypes.find((c) => c.slug === selectedType)?.pluralLabel}`
              : 'All Published Articles'}
          </h2>
        </div>

        {/* 1. Article Cards Grid (FIRST) */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} variant="default" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3 rounded-xl border border-dashed border-border p-8">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold">No articles found matching &quot;{query}&quot;</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Try searching for tool names like &quot;ElevenLabs&quot;, &quot;Lovable&quot;, or &quot;Canva&quot;, or clear your filter.
            </p>
          </div>
        )}

        {/* 2. Direct Section Matches (SECOND - below articles) */}
        {query && matchedHeadings.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-primary" /> Direct Section Matches
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {matchedHeadings.map(({ article, heading }) => (
                <Link
                  key={`${article.slug}-${heading.id}`}
                  href={`/${article.contentType}/${article.slug}#${heading.id}`}
                  className="group flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-accent/60 transition-colors text-xs"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    #{heading.text}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
