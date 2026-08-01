import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site.config';
import { ManifestEntry } from '@/types/content';
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
  FaqJsonLd,
} from '@/types/seo';

export function constructMetadata({
  title,
  description,
  canonical,
  ogImage,
  ogImageAlt,
  type = 'article',
  publishedTime,
  modifiedTime,
  authors = [siteConfig.author.name],
  tags = [],
}: {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}): Metadata {
  const url = canonical ? (canonical.startsWith('http') ? canonical : `${siteConfig.url}${canonical}`) : siteConfig.url;
  
  const dynamicOgUrl = `${siteConfig.url}/api/og?title=${encodeURIComponent(title)}&type=${encodeURIComponent(type)}`;

  const image = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${siteConfig.url}/${ogImage.replace(/^\//, '')}`
    : dynamicOgUrl;

  const imageAltText = ogImageAlt || title;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} — ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAltText,
        },
      ],
      type,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${siteConfig.name}`,
      description,
      images: [image],
    },
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    manifest: '/site.webmanifest',
  };
}

export function buildArticleJsonLd(
  article: ManifestEntry,
  url: string
): ArticleJsonLd {
  let coverImageUrl: string | undefined = undefined;

  if (article.cover) {
    if (article.cover.startsWith('http://') || article.cover.startsWith('https://')) {
      coverImageUrl = article.cover;
    } else {
      coverImageUrl = `${siteConfig.url}/${article.cover.replace(/^\//, '')}`;
    }
  }

  const dateModified =
    article.updatedAt && article.updatedAt !== article.publishedAt
      ? article.updatedAt
      : undefined;

  const socialLinks = [siteConfig.links.github, siteConfig.links.twitter]
    .filter(Boolean)
    .filter((link) => {
      try {
        const parsed = new URL(link);
        return parsed.pathname !== '' && parsed.pathname !== '/';
      } catch {
        return false;
      }
    });

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: coverImageUrl,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      jobTitle: siteConfig.author.role,
      description: siteConfig.author.bio,
      url: siteConfig.author.url || siteConfig.url,
      ...(socialLinks.length > 0 && { sameAs: socialLinks }),
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/og-default.png`,
      },
    },
    datePublished: article.publishedAt,
    ...(dateModified && { dateModified }),
    mainEntityOfPage: url,
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url?: string }>
): BreadcrumbJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
        ? item.url.startsWith('http')
          ? item.url
          : `${siteConfig.url}${item.url}`
        : undefined,
    })),
  };
}

export function buildOrganizationJsonLd(): OrganizationJsonLd {
  const socialLinks = [siteConfig.links.github, siteConfig.links.twitter]
    .filter(Boolean)
    .filter((link) => {
      try {
        const parsed = new URL(link);
        return parsed.pathname !== '' && parsed.pathname !== '/';
      } catch {
        return false;
      }
    });

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/og-default.png`,
    sameAs: socialLinks,
  };
}

export function buildWebSiteJsonLd(): WebSiteJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function decodeEntities(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanMarkdownText(str: string): string {
  return decodeEntities(
    str
      // Convert markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove inline code formatting
      .replace(/`([^`]+)`/g, '$1')
      // Remove bold and italic markers
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      .trim()
  );
}

export function buildFaqJsonLdFromContent(rawMdxContent: string): FaqJsonLd | null {
  const faqSectionMatch = rawMdxContent.match(/## (?:FAQ|Frequently Asked Questions)([\s\S]*?)(?=\n## |$)/i);
  if (!faqSectionMatch) return null;

  const faqText = faqSectionMatch[1];
  const faqItems: Array<{ question: string; answer: string }> = [];

  // 1. Match <FAQItem ... /> tags with quote-aware matching
  const faqBlockMatches = [...faqText.matchAll(/<FAQItem\b([\s\S]*?)\/>/gi)];

  if (faqBlockMatches.length > 0) {
    for (const match of faqBlockMatches) {
      const attrsStr = match[1];
      const qMatch = attrsStr.match(/question=(?:"([^"]*)"|'([^']*)')/i);
      const aMatch = attrsStr.match(/answer=(?:"([^"]*)"|'([^']*)')/i);

      if (qMatch && aMatch) {
        const question = cleanMarkdownText(qMatch[1] ?? qMatch[2] ?? '');
        const answer = cleanMarkdownText(aMatch[1] ?? aMatch[2] ?? '');
        if (question && answer) {
          faqItems.push({ question, answer });
        }
      }
    }
  }

  if (faqItems.length === 0) {
    // 2. Try matching HTML <details><summary>Question</summary>Answer</details> accordions
    const detailsMatches = [...faqText.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>/gi)];

    if (detailsMatches.length > 0) {
      for (const match of detailsMatches) {
        const question = cleanMarkdownText(match[1]);
        const answer = cleanMarkdownText(match[2]);
        if (question && answer) {
          faqItems.push({ question, answer });
        }
      }
    } else {
      // 3. Match H3 heading question patterns: ### Question?\n\nAnswer...
      const h3Matches = [...faqText.matchAll(/###\s+(.*?)\n+([\s\S]*?)(?=\n###|\n##|$)/g)];
      if (h3Matches.length > 0) {
        for (const m of h3Matches) {
          const question = cleanMarkdownText(m[1]);
          const answer = cleanMarkdownText(m[2]);
          if (question && answer) {
            faqItems.push({ question, answer });
          }
        }
      } else {
        // 4. Match plain paragraph questions (question line ending with ? followed by answer block)
        const blocks = faqText.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
        for (let i = 0; i < blocks.length - 1; i++) {
          const possibleQ = blocks[i];
          if (possibleQ.endsWith('?') && !possibleQ.startsWith('<') && !possibleQ.startsWith('#')) {
            const question = cleanMarkdownText(possibleQ);
            const answer = cleanMarkdownText(blocks[i + 1]);
            if (question && answer) {
              faqItems.push({ question, answer });
              i++; // Skip answer block
            }
          }
        }
      }
    }
  }

  if (faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question' as const,
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: item.answer,
      },
    })),
  };
}

export function buildItemListJsonLdFromContent(
  rawMdxContent: string,
  articleUrl: string
): Record<string, unknown> | null {
  const itemMatches = [...rawMdxContent.matchAll(/^##\s+(?:(\d+)\.\s+|(?:What is\s+)?([A-Z0-9][A-Za-z0-9\s.-]+?)(?:\?|$))/gm)];
  if (itemMatches.length === 0) return null;

  const itemListElement: Record<string, unknown>[] = [];
  let index = 1;

  for (const m of itemMatches) {
    const rawTitle = (m[2] || m[0]).replace(/^##\s+/, '').replace(/\?$/, '').trim();
    const lower = rawTitle.toLowerCase();
    
    if (
      lower.includes('faq') ||
      lower.includes('frequently') ||
      lower.includes('verdict') ||
      lower.includes('scorecard') ||
      lower.includes('how this') ||
      lower.includes('related') ||
      lower.includes('who should') ||
      lower.includes('category') ||
      lower.includes('quick')
    ) continue;

    const slug = `${index}-${rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    itemListElement.push({
      '@type': 'ListItem',
      position: index,
      name: rawTitle,
      url: `${articleUrl}#${slug}`,
    });
    index++;
  }

  if (itemListElement.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Tools & Comparison Breakdown',
    numberOfItems: itemListElement.length,
    itemListElement,
  };
}
