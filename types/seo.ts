/** JSON-LD Article schema */
export type ArticleJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image?: string;
  author: {
    '@type': 'Person';
    name: string;
    jobTitle?: string;
    description?: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    url?: string;
    logo?: { '@type': 'ImageObject'; url: string };
  };
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage: string;
};

/** JSON-LD Breadcrumb schema */
export type BreadcrumbJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
};

/** JSON-LD Organization schema */
export type OrganizationJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  sameAs?: string[];
};

/** JSON-LD WebSite + SearchAction schema */
export type WebSiteJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
};

/** JSON-LD FAQPage schema */
export type FaqJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
};

/** Link health data for SEO dashboard */
export type LinkHealth = {
  articleSlug: string;
  incomingLinks: string[];
  outgoingLinks: string[];
  brokenLinks: string[];
};
