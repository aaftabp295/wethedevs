import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ManifestEntry, Article } from '@/types/content';
import { parseFrontmatter } from './frontmatter';
import { calculateReadingTime } from './reading-time';
import { extractHeadings } from './headings';
import { extractOutgoingLinks } from './links';
import { contentTypeSlugs } from './content-types.config';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function getAllArticlesFromFiles(): Article[] {
  const articles: Article[] = [];

  if (!fs.existsSync(CONTENT_DIR)) {
    return articles;
  }

  contentTypeSlugs.forEach((contentType) => {
    const typeDir = path.join(CONTENT_DIR, contentType);
    if (!fs.existsSync(typeDir)) return;

    const slugs = fs.readdirSync(typeDir);

    slugs.forEach((slug) => {
      const articlePath = path.join(typeDir, slug, 'article.mdx');
      if (!fs.existsSync(articlePath)) return;

      const raw = fs.readFileSync(articlePath, 'utf-8');
      const { data, content } = matter(raw);

      const frontmatter = parseFrontmatter(data);
      const { words, minutes } = calculateReadingTime(content);
      const headings = extractHeadings(content);
      const stat = fs.statSync(articlePath);

      let updatedAt = frontmatter.updatedAt;
      if (!updatedAt) {
        const pubTime = new Date(frontmatter.publishedAt).getTime();
        const modTime = stat.mtime.getTime();
        if (modTime - pubTime > 3600 * 1000) {
          updatedAt = stat.mtime.toISOString();
        }
      }

      articles.push({
        ...frontmatter,
        updatedAt,
        content,
        readingTime: minutes,
        wordCount: words,
        headings,
      });
    });
  });

  return articles;
}

export function articleToManifestEntry(article: Article): ManifestEntry {
  const outgoingLinks = extractOutgoingLinks(article.content);

  return {
    title: article.title,
    slug: article.slug,
    contentType: article.contentType,
    topic: article.topic,
    tags: article.tags,
    description: article.description,
    headings: article.headings,
    cover: article.cover,
    coverAlt: article.coverAlt,
    readingTime: article.readingTime,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    draft: article.draft || false,
    featured: article.featured,
    outgoingLinks,
  };
}

export function getArticleBySlug(contentType: string, slug: string): Article | null {
  const articlePath = path.join(CONTENT_DIR, contentType, slug, 'article.mdx');
  if (!fs.existsSync(articlePath)) return null;

  const raw = fs.readFileSync(articlePath, 'utf-8');
  const { data, content } = matter(raw);

  const frontmatter = parseFrontmatter(data);
  const { words, minutes } = calculateReadingTime(content);
  const headings = extractHeadings(content);
  const stat = fs.statSync(articlePath);

  let updatedAt = frontmatter.updatedAt;
  if (!updatedAt) {
    const pubTime = new Date(frontmatter.publishedAt).getTime();
    const modTime = stat.mtime.getTime();
    if (modTime - pubTime > 3600 * 1000) {
      updatedAt = stat.mtime.toISOString();
    }
  }

  return {
    ...frontmatter,
    updatedAt,
    content,
    readingTime: minutes,
    wordCount: words,
    headings,
  };
}
