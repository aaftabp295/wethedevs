import { siteConfig } from '@/lib/site.config';
import { contentTypeSlugs } from '@/lib/content/content-types.config';

export async function GET() {
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2000/svg">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${siteConfig.url}</link>
    <description>${siteConfig.description}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${contentTypeSlugs
      .map(
        (slug) => `
    <item>
      <title>${siteConfig.name} — ${slug.toUpperCase()}</title>
      <link>${siteConfig.url}/${slug}</link>
      <description>Explore published ${slug} for software developers.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid>${siteConfig.url}/${slug}</guid>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
