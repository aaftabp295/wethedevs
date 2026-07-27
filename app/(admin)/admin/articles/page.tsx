'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getManifest } from '@/lib/content/manifest';
import { formatDateShort } from '@/lib/utils';
import { ExternalLink, Edit, PenSquare, FileEdit, Trash2, Loader2 } from 'lucide-react';

export default function AdminArticlesPage() {
  const router = useRouter();
  const [loadingSlug, setLoadingSlug] = React.useState<string | null>(null);
  const manifest = getManifest();
  const publishedArticles = manifest.articles.filter((a) => a.draft !== true);

  const handleUnpublishToDraft = async (contentType: string, slug: string) => {
    setLoadingSlug(`draft-${slug}`);
    try {
      const res = await fetch('/api/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, slug, draft: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.details || `Server error ${res.status}`);
      }
      router.refresh();
    } catch (err) {
      alert(`Unpublish error: ${(err as Error).message}`);
    } finally {
      setLoadingSlug(null);
    }
  };

  const handleDeleteArticle = async (contentType: string, slug: string) => {
    if (!confirm(`Are you sure you want to permanently delete article "/${contentType}/${slug}"? This cannot be undone.`)) {
      return;
    }

    setLoadingSlug(`delete-${slug}`);
    try {
      const res = await fetch(`/api/content?contentType=${contentType}&slug=${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.details || `Server error ${res.status}`);
      }
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
          <h2 className="text-2xl font-bold tracking-tight">Published Articles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all live, published articles across all content types.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/editor">
            <PenSquare className="h-4 w-4" />
            <span>New Article</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Live Articles ({publishedArticles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                  <th className="pb-3 pr-4">Article</th>
                  <th className="pb-3 px-4">Content Type</th>
                  <th className="pb-3 px-4">Topic</th>
                  <th className="pb-3 px-4">Published</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {publishedArticles.map((article) => {
                  const isProcessing = loadingSlug?.includes(article.slug);

                  return (
                    <tr key={article.slug} className="group hover:bg-accent/30">
                      <td className="py-4 pr-4 max-w-xs sm:max-w-md">
                        <p className="font-semibold text-foreground truncate">
                          {article.title}
                        </p>
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
                        {formatDateShort(article.publishedAt)}
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="icon" asChild title="Edit Article" className="h-8 w-8">
                            <Link href={`/admin/editor/${article.slug}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button variant="ghost" size="icon" asChild title="View Live Page" className="h-8 w-8">
                            <Link
                              href={`/${article.contentType}/${article.slug}`}
                              target="_blank"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleUnpublishToDraft(article.contentType, article.slug)}
                            title="Unpublish to Draft"
                            className="gap-1 text-xs"
                          >
                            {loadingSlug === `draft-${article.slug}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileEdit className="h-3.5 w-3.5" />
                            )}
                            <span>To Draft</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isProcessing}
                            onClick={() => handleDeleteArticle(article.contentType, article.slug)}
                            title="Delete Article"
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
        </CardContent>
      </Card>
    </div>
  );
}
