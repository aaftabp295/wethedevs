'use client';

import * as React from 'react';
import { Container } from '@/components/layout/container';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { contentTypes } from '@/lib/content/content-types.config';
import { Search as SearchIcon, FileText } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Search Articles
        </h1>
        <p className="text-muted-foreground">
          Find alternatives, comparisons, guides, and reviews across all topics.
        </p>

        {/* Input */}
        <div className="relative mt-6">
          <SearchIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, keyword, or tool name..."
            className="pl-10 h-11 text-base shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Content Type Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Badge
            variant={selectedType === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedType(null)}
          >
            All Types
          </Badge>
          {contentTypes.map((ct) => (
            <Badge
              key={ct.slug}
              variant={selectedType === ct.slug ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() =>
                setSelectedType(selectedType === ct.slug ? null : ct.slug)
              }
            >
              {ct.pluralLabel}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results placeholder */}
      <div className="mt-12 mx-auto max-w-3xl border-t border-border pt-8">
        <p className="text-sm font-medium text-muted-foreground mb-4">
          {query ? `Results for "${query}"` : 'Browse by Category'}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {contentTypes
            .filter((ct) => !selectedType || ct.slug === selectedType)
            .map((ct) => (
              <Link
                key={ct.slug}
                href={`/${ct.slug}`}
                className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-foreground/20 hover:bg-accent/50"
              >
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm group-hover:text-primary">
                    {ct.pluralLabel}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {ct.description}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </Container>
  );
}
