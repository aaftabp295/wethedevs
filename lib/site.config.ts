/** Site-wide configuration */
export const siteConfig = {
  name: 'We The Devs',
  description:
    'Premium editorial content on AI coding tools, alternatives, comparisons, and guides for developers.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://wethedevs.vercel.app',
  author: {
    name: 'Aaftab',
    role: 'Senior Software Engineer & Tech Reviewer',
    bio: 'Software engineer specializing in web architecture, AI developer tools, and design software comparisons.',
    url: 'https://wethedevs.vercel.app/author/aaftab',
  },
  links: {
    twitter: '',
    github: 'https://github.com/aaftabp295/wethedevs',
  },
} as const;
