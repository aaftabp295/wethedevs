import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    try {
      const redirectsFilePath = path.join(process.cwd(), 'content', 'redirects.json');
      if (fs.existsSync(redirectsFilePath)) {
        const data = fs.readFileSync(redirectsFilePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch {
      // Ignore fallback
    }
    return [];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-gfm'],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
