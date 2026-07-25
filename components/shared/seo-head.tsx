import * as React from 'react';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/types/seo';

interface SEOHeadProps {
  jsonLd?: ArticleJsonLd | BreadcrumbJsonLd | Array<ArticleJsonLd | BreadcrumbJsonLd>;
}

export function SEOHead({ jsonLd }: SEOHeadProps) {
  if (!jsonLd) return null;

  const payload = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

  return (
    <>
      {payload.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  );
}
