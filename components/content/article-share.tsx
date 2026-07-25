'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Share2 } from 'lucide-react';

interface ArticleShareProps {
  title: string;
  url: string;
}

export function ArticleShare({ title, url }: ArticleShareProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2 border-y border-border py-4">
      <span className="text-xs font-semibold text-muted-foreground mr-2">
        Share article:
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-1.5 text-xs"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-success" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy link</span>
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        asChild
        className="gap-1.5 text-xs"
      >
        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
          <Share2 className="h-3.5 w-3.5" />
          <span>Post</span>
        </a>
      </Button>
    </div>
  );
}
