'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArticleHeading } from '@/types/content';

interface ArticleTOCProps {
  headings: ArticleHeading[];
}

export function ArticleTOC({ headings }: ArticleTOCProps) {
  const [activeId, setActiveId] = React.useState<string>('');
  const navRef = React.useRef<HTMLDivElement>(null);

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

  // Auto-scroll the active TOC link into view inside the TOC container
  React.useEffect(() => {
    if (!activeId || !navRef.current) return;
    const activeLink = navRef.current.querySelector(`[data-toc-id="${CSS.escape(activeId)}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeId]);

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
    <nav className="flex flex-col space-y-3" aria-label="Table of contents">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex-shrink-0">
        On This Page
      </p>
      <div
        ref={navRef}
        className="max-h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden text-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="space-y-2 py-1">
          {headings.map((heading, index) => (
            <li
              key={`${heading.id}-${index}`}
              style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
            >
              <a
                href={`#${heading.id}`}
                data-toc-id={heading.id}
                onClick={(e) => scrollToHeading(e, heading.id)}
                className={cn(
                  'block line-clamp-2 transition-colors hover:text-foreground py-0.5',
                  activeId === heading.id
                    ? 'font-semibold text-primary border-l-2 border-primary -ml-2.5 pl-2'
                    : 'text-muted-foreground'
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

