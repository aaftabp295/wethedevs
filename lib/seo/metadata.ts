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
  
  const image = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${siteConfig.url}/${ogImage.replace(/^\//, '')}`
    : `${siteConfig.url}/images/og-default.png`;

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

export function buildFaqJsonLdFromContent(rawMdxContent: string): FaqJsonLd | null {
  const faqSectionMatch = rawMdxContent.match(/## (?:FAQ|Frequently Asked Questions)([\s\S]*?)(?=\n## |$)/i);
  if (!faqSectionMatch) return null;

  const faqText = faqSectionMatch[1];
  const faqItems: Array<{ question: string; answer: string }> = [];

  // 1. Match <FAQItem ... /> tags with quote-aware matching (allowing apostrophes inside double quotes)
  const faqBlockMatches = [...faqText.matchAll(/<FAQItem\b([\s\S]*?)\/>/gi)];

  if (faqBlockMatches.length > 0) {
    for (const match of faqBlockMatches) {
      const attrsStr = match[1];
      const qMatch = attrsStr.match(/question=(?:"([^"]*)"|'([^']*)')/i);
      const aMatch = attrsStr.match(/answer=(?:"([^"]*)"|'([^']*)')/i);

      if (qMatch && aMatch) {
        const question = (qMatch[1] ?? qMatch[2] ?? '').trim();
        const answer = (aMatch[1] ?? aMatch[2] ?? '').trim();
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
        const question = match[1].replace(/<[^>]+>/g, '').replace(/\*/g, '').trim();
        const answer = match[2].replace(/<[^>]+>/g, '').replace(/\[(.*?)\]\((.*?)\)/g, '$1').trim();
        if (question && answer) {
          faqItems.push({ question, answer });
        }
      }
    } else {
      // 3. Fallback to matching bold question patterns: **Question?** Answer...
      const qaMatches = [...faqText.matchAll(/\*\*(.*?)\*\*\s*([\s\S]*?)(?=\*\*|$)/g)];
      for (const m of qaMatches) {
        const question = m[1].replace(/\?/g, '').trim() + '?';
        const answer = m[2].replace(/\[(.*?)\]\((.*?)\)/g, '$1').trim();
        if (question && answer) {
          faqItems.push({ question, answer });
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
  // Match numbered headings starting with 1. 2. etc, either H2 (## 1. ...) or H3 (### 1. ...)
  const itemMatches = [...rawMdxContent.matchAll(/^(?:##|###)\s+(\d+)\.\s+(.*)$/gm)];
  if (itemMatches.length === 0) return null;

  const itemListElement = itemMatches.map((m, index) => {
    const rawTitle = m[2].trim();
    const slug = `${m[1]}-${rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: `${m[1]}. ${rawTitle}`,
      url: `${articleUrl}#${slug}`,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Tools',
    numberOfItems: itemListElement.length,
    itemListElement,
  };
}
