import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
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
