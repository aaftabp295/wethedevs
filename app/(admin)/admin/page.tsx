import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getManifest } from '@/lib/content/manifest';
import { validateLinksAndOrphans } from '@/lib/seo/validation';
import { contentTypes } from '@/lib/content/content-types.config';
import { formatDateShort } from '@/lib/utils';
import {
  FileText,
  FileEdit,
  PenSquare,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Search,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const manifest = getManifest();
  const validation = validateLinksAndOrphans(manifest);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Studio Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Git-backed publishing stats, content breakdown, and link health.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/editor">
            <PenSquare className="h-4 w-4" />
            <span>New Article</span>
          </Link>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Published Articles
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manifest.articles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Indexed in content-index.json
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Drafts
            </CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Unpublished drafts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Broken Internal Links
            </CardTitle>
            {validation.brokenLinks.length === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation.brokenLinks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {validation.brokenLinks.length === 0
                ? 'All internal links valid'
                : 'Action required in SEO view'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Orphan Pages
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation.orphanPages.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pages with 0 incoming links
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Breakdown by Type */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Content Types Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contentTypes.map((ct) => {
              const count = manifest.articles.filter(
                (a) => a.contentType === ct.slug
              ).length;

              return (
                <div
                  key={ct.slug}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {ct.slug}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {ct.pluralLabel}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Recent Publications
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/articles" className="gap-1 text-xs">
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {manifest.articles.slice(0, 5).map((article) => (
              <div
                key={article.slug}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {article.contentType} • {formatDateShort(article.publishedAt)}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                  {article.topic}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
