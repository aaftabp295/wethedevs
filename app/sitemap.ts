import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site.config';
import { getPublicArticles } from '@/lib/content/manifest';
import { contentTypeSlugs } from '@/lib/content/content-types.config';


export default function sitemap(): MetadataRoute.Sitemap {
  const publicArticles = getPublicArticles();
  const baseUrl = siteConfig.url;

  // Base pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Content type category pages
  const categoryRoutes: MetadataRoute.Sitemap = contentTypeSlugs.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Individual published articles (excluding drafts) with image sitemap support
  const articleRoutes: MetadataRoute.Sitemap = publicArticles.map((article) => {
    const images: string[] = [];
    if (article.cover) {
      images.push(article.cover.startsWith('http') ? article.cover : `${baseUrl}${article.cover.startsWith('/') ? '' : '/'}${article.cover}`);
    }

    return {
      url: `${baseUrl}/${article.contentType}/${article.slug}`,
      lastModified: new Date(article.updatedAt || article.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.9,
      images,
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
