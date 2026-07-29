'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ManifestEntry } from '@/types/content';
import { getPublicArticles } from '@/lib/content/manifest';
import { Globe, Link2, Search, Trash2, ExternalLink, FileText } from 'lucide-react';

export interface LinkInsertOptions {
  url: string;
  openInNewTab?: boolean;
  nofollow?: boolean;
}

interface LinkPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertLink: (options: LinkInsertOptions) => void;
  onRemoveLink?: () => void;
  initialUrl?: string;
  selectedText?: string;
}

export function LinkPicker({
  open,
  onOpenChange,
  onInsertLink,
  onRemoveLink,
  initialUrl = '',
  selectedText = '',
}: LinkPickerProps) {
  const [activeTab, setActiveTab] = React.useState<'external' | 'internal'>('external');
  const [url, setUrl] = React.useState('');
  const [openInNewTab, setOpenInNewTab] = React.useState(true);
  const [nofollow, setNofollow] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Fetch published internal articles
  const articles = React.useMemo(() => {
    if (!open) return [];
    return getPublicArticles();
  }, [open]);

  // Filter internal articles by search query
  const filteredArticles = React.useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const q = searchQuery.toLowerCase().trim();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.topic.toLowerCase().includes(q) ||
        a.contentType.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  // Initialize or reset form state when modal opens
  React.useEffect(() => {
    if (open) {
      setUrl(initialUrl || '');
      setSearchQuery('');
      setOpenInNewTab(initialUrl ? initialUrl.startsWith('http') : true);
      setNofollow(false);
      // Auto-switch tab based on initialUrl
      if (initialUrl && !initialUrl.startsWith('/') && !initialUrl.startsWith('http')) {
        setActiveTab('external');
      }
    }
  }, [open, initialUrl]);

  const handleApplyExternal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let finalUrl = url.trim();
    if (!finalUrl) return;

    // Auto-prepend https:// for external domains if missing protocol
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://') && !finalUrl.startsWith('/') && !finalUrl.startsWith('mailto:')) {
      finalUrl = `https://${finalUrl}`;
    }

    onInsertLink({
      url: finalUrl,
      openInNewTab,
      nofollow,
    });
    onOpenChange(false);
  };

  const handleSelectArticle = (article: ManifestEntry) => {
    const internalUrl = `/${article.contentType}/${article.slug}`;
    onInsertLink({
      url: internalUrl,
      openInNewTab: false,
      nofollow: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            <span>Insert Link</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {selectedText ? (
              <span>Applying link to: <strong className="text-foreground font-mono">"{selectedText}"</strong></span>
            ) : (
              <span>Insert an external web link or pick an internal article.</span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection Controls: External URL vs Internal Article */}
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('external')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'external'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>External Web URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('internal')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'internal'
                ? 'bg-background text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Internal Article</span>
          </button>
        </div>

        {/* Tab 1: External Web URL */}
        {activeTab === 'external' && (
          <form onSubmit={handleApplyExternal} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="external-url" className="text-xs font-medium block">
                Destination URL
              </label>
              <div className="relative">
                <Input
                  id="external-url"
                  type="text"
                  placeholder="https://example.com or https://github.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pr-8 text-xs font-mono"
                  autoFocus
                />
                {url && (
                  <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-primary"
                    title="Test URL in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Link Attribute Options */}
            <div className="space-y-2.5 pt-1 border-t border-border/50">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  Open link in new tab (<code className="text-[10px] bg-muted px-1 py-0.5 rounded">target="_blank"</code>)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={nofollow}
                  onChange={(e) => setNofollow(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  Mark as nofollow (<code className="text-[10px] bg-muted px-1 py-0.5 rounded">rel="nofollow"</code>)
                </span>
              </label>
            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
              {initialUrl && onRemoveLink ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onRemoveLink();
                    onOpenChange(false);
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Link</span>
                </Button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!url.trim()} className="text-xs font-semibold">
                  Apply Link
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}

        {/* Tab 2: Internal Article Search */}
        {activeTab === 'internal' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search internal articles by title, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs"
                autoFocus
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 rounded-md border border-border p-1">
              {filteredArticles.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No internal articles matching "{searchQuery}"
                </div>
              ) : (
                filteredArticles.map((article) => (
                  <button
                    key={article.slug}
                    type="button"
                    onClick={() => handleSelectArticle(article)}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-accent text-left transition-colors group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-xs truncate group-hover:text-primary transition-colors">
                        {article.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        /{article.contentType}/{article.slug}
                      </p>
                    </div>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded capitalize shrink-0 font-medium">
                      {article.contentType}
                    </span>
                  </button>
                ))
              )}
            </div>

            <DialogFooter className="flex items-center justify-between pt-1">
              {initialUrl && onRemoveLink ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onRemoveLink();
                    onOpenChange(false);
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Link</span>
                </Button>
              ) : (
                <span />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs ml-auto"
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
