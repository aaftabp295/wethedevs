import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPublicArticles } from '@/lib/content/manifest';
import { Tags } from 'lucide-react';

export default function AdminTopicsPage() {
  const publishedArticles = getPublicArticles();

  // Aggregate topics and article counts
  const topicCounts: Record<string, number> = {};
  publishedArticles.forEach((article) => {
    topicCounts[article.topic] = (topicCounts[article.topic] || 0) + 1;
  });

  const topics = Object.entries(topicCounts).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight">Topics Taxonomy</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Metadata topics used for categorization, breadcrumbs, and related articles.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Active Topics ({topics.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <div
                key={topic.name}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-2">
                  <Tags className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">{topic.name}</span>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {topic.count} {topic.count === 1 ? 'article' : 'articles'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
