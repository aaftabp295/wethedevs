import type { ContentTypeConfig } from '@/types/content';

export const contentTypes: ContentTypeConfig[] = [
  {
    slug: 'alternatives',
    label: 'Alternative',
    pluralLabel: 'Alternatives',
    icon: 'ArrowLeftRight',
    description: 'Discover the best alternatives to popular tools',
    listingBehavior: { sortBy: 'publishedAt', sortOrder: 'desc', perPage: 12 },
  },
  {
    slug: 'comparisons',
    label: 'Comparison',
    pluralLabel: 'Comparisons',
    icon: 'GitCompare',
    description: 'Side-by-side comparisons of developer tools',
    listingBehavior: { sortBy: 'publishedAt', sortOrder: 'desc', perPage: 12 },
  },
  {
    slug: 'reviews',
    label: 'Review',
    pluralLabel: 'Reviews',
    icon: 'Star',
    description: 'In-depth reviews of tools and platforms',
    listingBehavior: { sortBy: 'publishedAt', sortOrder: 'desc', perPage: 12 },
  },
  {
    slug: 'guides',
    label: 'Guide',
    pluralLabel: 'Guides',
    icon: 'BookOpen',
    description: 'Step-by-step guides and tutorials',
    listingBehavior: { sortBy: 'publishedAt', sortOrder: 'desc', perPage: 12 },
  },
  {
    slug: 'news',
    label: 'News',
    pluralLabel: 'News',
    icon: 'Newspaper',
    description: 'Latest news from the developer ecosystem',
    listingBehavior: { sortBy: 'publishedAt', sortOrder: 'desc', perPage: 20 },
  },
  {
    slug: 'resources',
    label: 'Resource',
    pluralLabel: 'Resources',
    icon: 'Package',
    description: 'Curated resources for developers',
    listingBehavior: { sortBy: 'title', sortOrder: 'asc', perPage: 24 },
  },
];

/** Lookup a content type by slug */
export function getContentType(slug: string): ContentTypeConfig | undefined {
  return contentTypes.find((ct) => ct.slug === slug);
}

/** All valid content type slugs */
export const contentTypeSlugs = contentTypes.map((ct) => ct.slug);
