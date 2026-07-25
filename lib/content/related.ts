import { ManifestEntry } from '@/types/content';

export function getRelatedArticles(
  currentSlug: string,
  allArticles: ManifestEntry[],
  limit = 3
): ManifestEntry[] {
  const current = allArticles.find((a) => a.slug === currentSlug);
  if (!current) return [];

  const candidates = allArticles.filter(
    (a) => a.slug !== currentSlug
  );

  const scored = candidates.map((article) => {
    let score = 0;

    // Matching Topic (weight: 5)
    if (article.topic.toLowerCase() === current.topic.toLowerCase()) {
      score += 5;
    }

    // Matching Content Type (weight: 1)
    if (article.contentType === current.contentType) {
      score += 1;
    }

    // Shared Tags (weight: 3 per tag)
    const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));
    article.tags.forEach((tag) => {
      if (currentTags.has(tag.toLowerCase())) {
        score += 3;
      }
    });

    return { article, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.article);
}
