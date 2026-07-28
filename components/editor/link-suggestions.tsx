'use client';

import * as React from 'react';
import { ManifestEntry } from '@/types/content';
import { getPublicArticles } from '@/lib/content/manifest';
import { Button } from '@/components/ui/button';
import { Link2, Plus } from 'lucide-react';

interface LinkSuggestionsProps {
  topic?: string;
  onInsertLink: (article: ManifestEntry) => void;
}

export function LinkSuggestions({ topic, onInsertLink }: LinkSuggestionsProps) {
  const suggestions = React.useMemo(() => {
    const publicArticles = getPublicArticles();
    if (!topic) {
      return publicArticles.slice(0, 4);
    }
    const filtered = publicArticles.filter(
      (a) => a.topic.toLowerCase() === topic.toLowerCase()
    );
    return filtered.length > 0 ? filtered : publicArticles.slice(0, 4);
  }, [topic]);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Suggested Internal Links
        </h3>
        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        {suggestions.map((article) => (
          <div
            key={article.slug}
            className="flex items-center justify-between gap-2 p-2 rounded-md border border-border hover:bg-accent/50 text-xs transition-colors"
          >
            <div className="min-w-0">
              <p className="font-semibold truncate">{article.title}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                /{article.contentType}/{article.slug}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => onInsertLink(article)}
              title="Insert Link"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
