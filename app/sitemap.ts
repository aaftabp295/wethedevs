import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site.config';
import { contentTypeSlugs } from '@/lib/content/content-types.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/search`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ];

  // Content type listing pages
  const listingPages: MetadataRoute.Sitemap = contentTypeSlugs.map((slug) => ({
    url: `${siteConfig.url}/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Article pages will be added dynamically in Phase 4
  // when the content manifest is available

  return [...staticPages, ...listingPages];
}
