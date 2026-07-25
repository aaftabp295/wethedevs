/** Site-wide configuration */
export const siteConfig = {
  name: 'We The Devs',
  description:
    'Premium editorial content on AI coding tools, alternatives, comparisons, and guides for developers.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  author: {
    name: 'Aaftab',
    url: '',
  },
  links: {
    twitter: '',
    github: '',
  },
} as const;
