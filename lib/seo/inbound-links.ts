import { ManifestEntry } from '@/types/content';

export type InboundCandidate = {
  candidate: ManifestEntry;
  score: number;
  bestHeadingOrParagraphExcerpt: string;
};

/**
 * Fast, deterministic local content graph scoring (<5ms)
 * Computes semantic similarity between target article and published articles in site manifest
 */
export function findInboundCandidates(
  targetSlug: string,
  targetTitle: string,
  targetTopic: string,
  targetTags: string[],
  articles: ManifestEntry[],
  limit = 5
): InboundCandidate[] {
  const targetWords = (targetTitle + ' ' + (targetTopic || ''))
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const targetTagSet = new Set((targetTags || []).map((t) => t.toLowerCase()));

  const candidates: InboundCandidate[] = [];

  for (const article of articles) {
    // Skip draft articles, self-references, or articles that ALREADY link to targetSlug
    if (article.draft) continue;
    if (article.slug === targetSlug) continue;
    if (article.outgoingLinks && article.outgoingLinks.includes(targetSlug)) continue;

    let score = 0;

    // Signal 1: Same Topic (+5)
    if (targetTopic && article.topic && targetTopic.toLowerCase() === article.topic.toLowerCase()) {
      score += 5;
    }

    // Signal 2: Shared Tags (+3 per tag)
    if (article.tags && article.tags.length > 0) {
      for (const tag of article.tags) {
        if (targetTagSet.has(tag.toLowerCase())) {
          score += 3;
        }
      }
    }

    // Signal 3: Title & Description Word Overlap (+2 per keyword)
    const candidateText = (article.title + ' ' + (article.description || '')).toLowerCase();
    for (const word of targetWords) {
      if (candidateText.includes(word)) {
        score += 2;
      }
    }

    // Require a minimum threshold score of 2 to be considered relevant
    if (score >= 2) {
      let bestSnippet = article.title;
      if (article.headings && article.headings.length > 0) {
        const matchedHeading = article.headings.find((h) =>
          targetWords.some((w) => h.text.toLowerCase().includes(w))
        );
        bestSnippet = matchedHeading ? matchedHeading.text : article.headings[0].text;
      }

      candidates.push({
        candidate: article,
        score,
        bestHeadingOrParagraphExcerpt: bestSnippet,
      });
    }
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit);
}
