import { ContentManifest } from '@/types/content';
import { buildFaqJsonLdFromContent } from './metadata';

export type FaqSyncIssue = {
  slug: string;
  issue: string;
};

export type ValidationReport = {
  brokenLinks: Array<{ sourceSlug: string; targetSlug: string }>;
  orphanPages: string[];
  faqIssues: FaqSyncIssue[];
  totalArticles: number;
};

export function validateFaqSchemaSync(
  slug: string,
  rawContent: string
): FaqSyncIssue[] {
  const issues: FaqSyncIssue[] = [];
  const faqJsonLd = buildFaqJsonLdFromContent(rawContent);

  if (!faqJsonLd) return issues;

  faqJsonLd.mainEntity.forEach((item, index) => {
    const q = item.name;
    const a = item.acceptedAnswer.text;

    // Check for unparsed markdown link brackets or malformed formatting
    if (q.includes('[') || q.includes(']') || a.includes('[') || a.includes(']')) {
      issues.push({
        slug,
        issue: `FAQ #${index + 1} ("${q.slice(0, 30)}...") contains unparsed markdown bracket fragments in JSON-LD.`,
      });
    }

    if (!q.trim() || !a.trim()) {
      issues.push({
        slug,
        issue: `FAQ #${index + 1} has an empty question or answer in JSON-LD.`,
      });
    }
  });

  return issues;
}

export function validateLinksAndOrphans(
  manifest: ContentManifest
): ValidationReport {
  const articles = manifest.articles.filter((a) => a.draft !== true);
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
    faqIssues: [],
    totalArticles: articles.length,
  };
}
