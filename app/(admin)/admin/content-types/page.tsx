import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { contentTypes } from '@/lib/content/content-types.config';
import { getManifest } from '@/lib/content/manifest';

export default function AdminContentTypesPage() {
  const manifest = getManifest();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight">Content Types Registry</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configured content models. New types are defined in <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">content-types.config.ts</code>.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contentTypes.map((ct) => {
          const count = manifest.articles.filter(
            (a) => a.contentType === ct.slug
          ).length;

          return (
            <Card key={ct.slug}>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="capitalize">
                    /{ct.slug}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    {count} {count === 1 ? 'article' : 'articles'}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold">
                  {ct.pluralLabel}
                </CardTitle>
                <CardDescription className="text-xs">
                  {ct.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 border-t border-border mt-4 text-xs space-y-2">
                <div className="flex justify-between pt-3 text-muted-foreground">
                  <span>Single Label:</span>
                  <span className="font-medium text-foreground">{ct.label}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Default Sort:</span>
                  <span className="font-medium text-foreground capitalize">
                    {ct.listingBehavior.sortBy} ({ct.listingBehavior.sortOrder})
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Per Page Limit:</span>
                  <span className="font-medium text-foreground font-mono">
                    {ct.listingBehavior.perPage}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
