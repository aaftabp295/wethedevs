import { ArticleHeading } from '@/types/content';
import { slugify } from '@/lib/utils';

export function extractHeadings(content: string): ArticleHeading[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: ArticleHeading[] = [];
  const seenIds = new Map<string, number>();
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3 | 4;
    const text = match[2].trim().replace(/[*_~`]/g, '');
    const baseId = slugify(text);

    const count = seenIds.get(baseId) || 0;
    const id = count === 0 ? baseId : `${baseId}-${count}`;
    seenIds.set(baseId, count + 1);

    headings.push({ id, text, level });
  }

  return headings;
}

