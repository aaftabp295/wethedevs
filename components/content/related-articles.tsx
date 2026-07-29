import { ArticleCard } from './article-card';
import { ManifestEntry } from '@/types/content';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RelatedArticlesProps {
  articles: ManifestEntry[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <span>Related Comparisons & Guides</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Explore more in-depth reviews, benchmarks, and developer tool breakdowns.
          </p>
        </div>
        <Link
          href="/alternatives"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-all"
        >
          <span>View All Comparisons</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
