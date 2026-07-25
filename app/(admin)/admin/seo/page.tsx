import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getManifest } from '@/lib/content/manifest';
import { validateLinksAndOrphans } from '@/lib/seo/validation';
import { CheckCircle2, AlertTriangle, Search, Link2 } from 'lucide-react';

export default function AdminSEOPage() {
  const manifest = getManifest();
  const validation = validateLinksAndOrphans(manifest);

  // Compute incoming links per article
  const incomingMap: Record<string, string[]> = {};
  manifest.articles.forEach((a) => {
    incomingMap[a.slug] = [];
  });
  manifest.articles.forEach((article) => {
    article.outgoingLinks.forEach((targetSlug) => {
      if (incomingMap[targetSlug]) {
        incomingMap[targetSlug].push(article.slug);
      }
    });
  });

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight">SEO & Link Graph</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Inspect internal linking structure, broken links, and orphan page warnings.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Link Health Status
            </CardTitle>
            {validation.brokenLinks.length === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation.brokenLinks.length === 0 ? 'Healthy' : 'Attention Needed'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {validation.brokenLinks.length} broken internal links detected
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
              Articles with 0 incoming internal links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
              Total Index Entries
            </CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {manifest.articles.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Indexed in sitemap & content-index.json
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orphan Pages Warning */}
      {validation.orphanPages.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-warning flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Orphan Pages Detected</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              These articles have no incoming internal links. Consider linking to them from related articles to improve crawlability.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {validation.orphanPages.map((slug) => (
                <Badge key={slug} variant="outline" className="font-mono text-xs">
                  {slug}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Internal Link Graph Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Internal Link Graph ({manifest.articles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground font-semibold">
                  <th className="pb-3 pr-4">Article</th>
                  <th className="pb-3 px-4">Incoming Links</th>
                  <th className="pb-3 px-4">Outgoing Links</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {manifest.articles.map((article) => {
                  const incoming = incomingMap[article.slug] || [];
                  const isOrphan = incoming.length === 0;

                  return (
                    <tr key={article.slug} className="group hover:bg-accent/30">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-foreground">{article.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          /{article.contentType}/{article.slug}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-semibold">
                          {incoming.length}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-semibold">
                          {article.outgoingLinks.length}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        {isOrphan ? (
                          <Badge variant="outline" className="text-warning border-warning/50">
                            Orphan
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-success">
                            Linked
                          </Badge>
                        )}
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
