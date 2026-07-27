import { z } from 'zod';
import { contentTypeSlugs } from './content-types.config';
import { ArticleFrontmatter } from '@/types/content';

export const FrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(320),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  contentType: z.enum(contentTypeSlugs as [string, ...string[]]),
  topic: z.string().min(1, 'Topic is required'),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  publishedAt: z.string(),
  updatedAt: z.string().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  canonical: z.string().url().optional(),
  author: z.string().optional(),
});

export function parseFrontmatter(data: Record<string, unknown>): ArticleFrontmatter {
  const result = FrontmatterSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    throw new Error(`Invalid frontmatter: ${errors}`);
  }

  return result.data as ArticleFrontmatter;
}
