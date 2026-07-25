import { parseFrontmatter } from '@/lib/content/frontmatter';
import { ArticleFrontmatter } from '@/types/content';

export function validatePublishPayload(
  payload: Record<string, unknown>
): { valid: boolean; frontmatter?: ArticleFrontmatter; errors?: string[] } {
  try {
    const frontmatter = parseFrontmatter(payload);
    return { valid: true, frontmatter };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid frontmatter payload';
    return { valid: false, errors: [message] };
  }
}
