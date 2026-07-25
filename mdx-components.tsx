import type { MDXComponents } from 'mdx/types';

// Custom MDX components will be added in Phase 4
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
