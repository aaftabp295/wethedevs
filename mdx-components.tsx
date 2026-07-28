import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import React from 'react';
import { FAQItem } from '@/components/content/faq-item';
import { ChevronDown } from 'lucide-react';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    FAQItem,
    a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) => {
      const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
      if (isInternal) {
        return (
          <Link href={href} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
    h1: ({ children, ...props }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text);
      return <h1 id={id} {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text);
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text);
      return <h3 id={id} className="text-xl font-bold tracking-tight mt-8 mb-3 text-foreground" {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text);
      return <h4 id={id} {...props}>{children}</h4>;
    },
    table: ({ children, ...props }) => (
      <div className="my-6 w-full overflow-x-auto rounded-xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-left text-sm min-w-[580px]" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th scope="col" className="bg-muted/50 font-semibold p-3 border-b border-border/80 text-foreground" {...props}>
        {children}
      </th>
    ),
    caption: ({ children, ...props }) => (
      <caption className="mt-2 text-xs text-muted-foreground italic text-center caption-bottom" {...props}>
        {children}
      </caption>
    ),
    details: ({ children, ...props }: React.ComponentPropsWithoutRef<'details'>) => (
      <details className="group border border-border/80 rounded-xl bg-card p-4 my-3 transition-all duration-200 open:bg-muted/20" {...props}>
        {children}
      </details>
    ),
    summary: ({ children, ...props }: React.ComponentPropsWithoutRef<'summary'>) => (
      <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between list-none select-none outline-none" {...props}>
        <span className="flex-1 pr-2">{children}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-2" />
      </summary>
    ),
    img: ({ src, alt, title }) => {
      if (!src) return null;

      return (
        <span className="block my-8 text-center">
          <span className="inline-block overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-xs max-w-full">
            <Image
              src={src}
              alt={alt || 'Article illustration'}
              width={1200}
              height={675}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="mx-auto rounded-xl max-w-full h-auto object-cover"
            />
          </span>
          {title && (
            <span className="block mt-2 text-center text-xs text-muted-foreground italic">
              {title}
            </span>
          )}
        </span>
      );
    },
    ...components,
  };
}
