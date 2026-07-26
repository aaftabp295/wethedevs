'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/content/empty-state';
import { getManifest } from '@/lib/content/manifest';
import { formatDateShort } from '@/lib/utils';
import { Edit, PenSquare, Trash2, Send, Loader2 } from 'lucide-react';

export default function AdminDraftsPage() {
  const router = useRouter();
  const [loadingSlug, setLoadingSlug] = React.useState<string | null>(null);
  const manifest = getManifest();
  const drafts = manifest.articles.filter((a) => a.draft === true);

  const handlePublishDraft = async (contentType: string, slug: string) => {
    setLoadingSlug(`publish-${slug}`);
    try {
      const res = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, slug, draft: false }),
      });
      if (!res.ok) throw new Error('Failed to publish draft');
      router.refresh();
    } catch (err) {
      alert(`Publish error: ${(err as Error).message}`);
    } finally {
      setLoadingSlug(null);
    }
  };

  const handleDeleteDraft = async (contentType: string, slug: string) => {
    if (!confirm(`Are you sure you want to permanently delete draft "/${contentType}/${slug}"?`)) {
      return;
    }

    setLoadingSlug(`delete-${slug}`);
    try {
      const res = await fetch(`/api/content?contentType=${contentType}&slug=${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete draft');
      router.refresh();
    } catch (err) {
      alert(`Delete error: ${(err as Error).message}`);
    } finally {
      setLoadingSlug(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drafts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Work in progress articles saved as drafts.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/editor">
            <PenSquare className="h-4 w-4" />
            <span>New Draft</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Saved Drafts ({drafts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <EmptyState
              title="No active drafts"
              description="You don't have any saved drafts. Start a new article in the Tiptap editor."
              actionLabel="Open Editor"
              actionHref="/admin/editor"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                    <th className="pb-3 pr-4">Draft Article</th>
                    <th className="pb-3 px-4">Content Type</th>
                    <th className="pb-3 px-4">Topic</th>
                    <th className="pb-3 px-4">Last Updated</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {drafts.map((article) => {
                    const isProcessing = loadingSlug?.includes(article.slug);

                    return (
                      <tr key={article.slug} className="group hover:bg-accent/30">
                        <td className="py-4 pr-4 max-w-xs sm:max-w-md">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground truncate">
                              {article.title}
                            </p>
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              Draft
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            /{article.contentType}/{article.slug}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="capitalize">
                            {article.contentType}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-xs text-muted-foreground">
                          {article.topic}
                        </td>
                        <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateShort(article.updatedAt || article.publishedAt)}
                        </td>
                        <td className="py-4 pl-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" asChild title="Edit Draft" className="gap-1.5 text-xs">
                              <Link href={`/admin/editor/${article.slug}`}>
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Link>
                            </Button>

                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handlePublishDraft(article.contentType, article.slug)}
                              title="Publish Draft"
                              className="gap-1.5 text-xs font-semibold"
                            >
                              {loadingSlug === `publish-${article.slug}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              <span>Publish</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isProcessing}
                              onClick={() => handleDeleteDraft(article.contentType, article.slug)}
                              title="Delete Draft"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              {loadingSlug === `delete-${article.slug}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
