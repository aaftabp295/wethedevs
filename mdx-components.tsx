import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import { slugify } from '@/lib/utils';
import React from 'react';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
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
      return <h3 id={id} {...props}>{children}</h3>;
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
              unoptimized
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
