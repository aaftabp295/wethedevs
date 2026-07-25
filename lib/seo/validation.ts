import { ContentManifest } from '@/types/content';

export type ValidationReport = {
  brokenLinks: Array<{ sourceSlug: string; targetSlug: string }>;
  orphanPages: string[];
  totalArticles: number;
};

export function validateLinksAndOrphans(
  manifest: ContentManifest
): ValidationReport {
  const articles = manifest.articles;
  const validSlugs = new Set(articles.map((a) => a.slug));
  const incomingLinkCounts: Record<string, number> = {};

  articles.forEach((a) => {
    incomingLinkCounts[a.slug] = 0;
  });

  const brokenLinks: Array<{ sourceSlug: string; targetSlug: string }> = [];

  articles.forEach((article) => {
    article.outgoingLinks.forEach((targetSlug) => {
      if (validSlugs.has(targetSlug)) {
        incomingLinkCounts[targetSlug] = (incomingLinkCounts[targetSlug] || 0) + 1;
      } else {
        brokenLinks.push({
          sourceSlug: article.slug,
          targetSlug,
        });
      }
    });
  });

  const orphanPages = Object.entries(incomingLinkCounts)
    .filter(([, count]) => count === 0)
    .map(([slug]) => slug);

  return {
    brokenLinks,
    orphanPages,
    totalArticles: articles.length,
  };
}
