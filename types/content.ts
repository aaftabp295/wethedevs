/** Content type slug — must match a key in the content type registry */
export type ContentTypeSlug =
  | 'alternatives'
  | 'comparisons'
  | 'reviews'
  | 'guides'
  | 'news'
  | 'resources';

/** Article frontmatter — validated at build time via Zod */
export type ArticleFrontmatter = {
  title: string;
  description: string;
  slug: string;
  contentType: ContentTypeSlug;
  topic: string;
  tags: string[];
  cover?: string;
  publishedAt: string;
  updatedAt?: string;
  draft: boolean;
  featured: boolean;
  canonical?: string;
  author?: string;
};

/** Heading extracted from article content */
export type ArticleHeading = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

/** Full article — frontmatter + computed fields */
export type Article = ArticleFrontmatter & {
  content: string;
  readingTime: number;
  headings: ArticleHeading[];
  wordCount: number;
};

/** Manifest entry — lightweight article metadata for listings/search */
export type ManifestEntry = {
  title: string;
  slug: string;
  contentType: ContentTypeSlug;
  topic: string;
  tags: string[];
  description: string;
  headings: ArticleHeading[];
  cover?: string;
  readingTime: number;
  publishedAt: string;
  updatedAt?: string;
  featured: boolean;
  outgoingLinks: string[];
};

/** Content manifest — the entire site index */
export type ContentManifest = {
  articles: ManifestEntry[];
  generatedAt: string;
};

/** Topic metadata */
export type Topic = {
  slug: string;
  label: string;
  description?: string;
};

/** Content type configuration */
export type ContentTypeConfig = {
  slug: ContentTypeSlug;
  label: string;
  pluralLabel: string;
  icon: string;
  description: string;
  listingBehavior: {
    sortBy: 'publishedAt' | 'updatedAt' | 'title';
    sortOrder: 'asc' | 'desc';
    perPage: number;
  };
};
