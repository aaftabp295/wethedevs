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
          alt: title,
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

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: coverImageUrl,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.author.url || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/og-default.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/og-default.png`,
    sameAs: [siteConfig.links.twitter, siteConfig.links.github].filter(Boolean),
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

/** Extract FAQ questions and answers from article Markdown text to build FAQPage JSON-LD schema */
export function buildFaqJsonLdFromContent(content: string): FaqJsonLd | null {
  if (!content) return null;

  // Locate ## FAQ or ## Frequently asked questions section
  const faqSectionMatch = content.match(/##\s*(?:FAQ|Frequently\s+asked\s+questions)([\s\S]*?)(?=\n##|\n#|$)/i);
  if (!faqSectionMatch) return null;

  const faqText = faqSectionMatch[1];
  const faqItems: Array<{ question: string; answer: string }> = [];

  // Match bold question patterns: **Question?** Answer paragraph...
  const qaMatches = [...faqText.matchAll(/\*\*(.+?\?)\*\*\s*([\s\S]*?)(?=\n\*\*|\n##|$)/g)];

  for (const match of qaMatches) {
    const question = match[1].trim();
    const answer = match[2]
      .replace(/<[^>]+>/g, '') // Strip inline HTML
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert markdown links to text
      .trim();

    if (question && answer) {
      faqItems.push({ question, answer });
    }
  }

  if (faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
