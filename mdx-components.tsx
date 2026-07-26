import type { MDXComponents } from 'mdx/types';
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
    ...components,
  };
}
