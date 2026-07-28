'use client';

import * as React from 'react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { ManifestEntry } from '@/types/content';
import { getPublicArticles } from '@/lib/content/manifest';
import { Link2 } from 'lucide-react';

interface LinkPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectArticle: (article: ManifestEntry) => void;
}

export function LinkPicker({
  open,
  onOpenChange,
  onSelectArticle,
}: LinkPickerProps) {
  const articles = React.useMemo(() => {
    if (!open) return [];
    return getPublicArticles();
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search internal articles to link..." />
      <CommandList>
        <CommandEmpty>No articles found.</CommandEmpty>
        <CommandGroup heading="Published Articles">
          {articles.map((article) => (
            <CommandItem
              key={article.slug}
              value={`${article.title} ${article.topic} ${article.contentType}`}
              onSelect={() => {
                onSelectArticle(article);
                onOpenChange(false);
              }}
              className="flex items-center justify-between cursor-pointer py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{article.title}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    /{article.contentType}/{article.slug}
                  </p>
                </div>
              </div>
              <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize shrink-0 ml-2">
                {article.contentType}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
