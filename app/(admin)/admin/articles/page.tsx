import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getManifest } from '@/lib/content/manifest';
import { formatDateShort } from '@/lib/utils';
import { ExternalLink, Edit, PenSquare } from 'lucide-react';

export default function AdminArticlesPage() {
  const manifest = getManifest();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Published Articles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all active articles across all content types.
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
            All Articles ({manifest.articles.length})
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
                {manifest.articles.map((article) => (
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
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="Edit Article">
                          <Link href={`/admin/editor/${article.slug}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="View Live Page">
                          <Link
                            href={`/${article.contentType}/${article.slug}`}
                            target="_blank"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
