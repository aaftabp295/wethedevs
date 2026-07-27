import * as React from 'react';

type JsonLdSchema = Record<string, unknown>;

interface SEOHeadProps {
  jsonLd?: JsonLdSchema | null | Array<JsonLdSchema | null | undefined>;
}

export function SEOHead({ jsonLd }: SEOHeadProps) {
  if (!jsonLd) return null;

  const rawPayload = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  const payload = rawPayload.filter(Boolean) as JsonLdSchema[];

  if (payload.length === 0) return null;

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
