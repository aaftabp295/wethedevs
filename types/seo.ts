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
  };
  publisher: {
    '@type': 'Organization';
    name: string;
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

/** Link health data for SEO dashboard */
export type LinkHealth = {
  articleSlug: string;
  incomingLinks: string[];
  outgoingLinks: string[];
  brokenLinks: string[];
};
