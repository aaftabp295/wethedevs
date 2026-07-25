import { ArticleHeading } from '@/types/content';
import { slugify } from '@/lib/utils';

export function extractHeadings(content: string): ArticleHeading[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: ArticleHeading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3 | 4;
    const text = match[2].trim().replace(/[*_~`]/g, '');
    const id = slugify(text);

    headings.push({ id, text, level });
  }

  return headings;
}
