'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArticleHeading } from '@/types/content';

interface ArticleTOCProps {
  headings: ArticleHeading[];
}

export function ArticleTOC({ headings }: ArticleTOCProps) {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0% -60% 0%' }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // Topbar clearance offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
      window.history.pushState(null, '', `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-3" aria-label="Table of contents">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        On This Page
      </p>
      <ul className="space-y-2 text-xs">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => scrollToHeading(e, heading.id)}
              className={cn(
                'block line-clamp-2 transition-colors hover:text-foreground',
                activeId === heading.id
                  ? 'font-medium text-foreground border-l-2 border-primary -ml-2.5 pl-2'
                  : 'text-muted-foreground'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
