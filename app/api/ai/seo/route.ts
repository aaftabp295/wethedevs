import { NextResponse } from 'next/server';
import { AiSeoRequestBody } from '@/types/ai-seo';
import { ManifestEntry } from '@/types/content';

const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

async function callGeminiApi(apiKey: string, payload: unknown) {
  let lastError = 'Failed to call Gemini API';

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        lastError = errorJson.error?.message || `HTTP ${res.status} from ${model}`;
        continue;
      }

      const data = await res.json();
      return data;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastError);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Gemini API key is required. Please provide it in settings.' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '').trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key cannot be empty.' },
        { status: 401 }
      );
    }

    const body: AiSeoRequestBody = await request.json();
    const { action, articleHtml, publishState, manifest } = body;

    // Direct lightweight handler for API Key Validation
    if (action === 'validate-key') {
      try {
        await callGeminiApi(apiKey, {
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        });
        return NextResponse.json({ success: true, valid: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid API Key';
        return NextResponse.json({ error: msg, valid: false }, { status: 400 });
      }
    }

    let systemInstruction = '';
    let userPrompt = '';

    if (action === 'internal-links') {
      systemInstruction = `You are the Lead Editorial Technical SEO Architect for wethedevs.com.
Your goal is to suggest high-value internal link Callout Cards between the current article and articles in the site manifest, strictly adhering to the wethedevs publication standard.

EDITORIAL INTERNAL LINKING RULES:
1. ONLY suggest target URLs from the provided Site Manifest.
2. Target URLs MUST be relative Next.js internal paths format: "/\${contentType}/\${slug}" (e.g., "/alternatives/replit-alternatives" or "/comparisons/lovable-vs-bolt"). NEVER return absolute domain URLs.
3. ALL internal links MUST be type "callout". Do NOT suggest inline links.
4. For every callout link:
   - "contextExcerpt": A 5-15 word exact phrase from the target paragraph in the document after which the "💡 Related Guide" callout card should be placed.
   - "anchorText": The exact title of the target article.
   - "reason": A smooth, natural editorial transition rationale sentence (e.g. "If your project requires marketing visuals rather than full UI code,", "If you are exploring cloud IDEs, desktop editors, and no-code tools specifically replacing Replit,").
5. CRITICAL POSITIONING RULE: NEVER suggest callout cards within the first 3 paragraphs (or intro section) of the article. Callout cards MUST ONLY be placed after paragraph 4 onwards or deeper inside the article body.
6. Do NOT suggest linking an article to itself.`;

      const manifestSummary = (manifest || []).map((art: ManifestEntry) => ({
        title: art.title,
        slug: art.slug,
        contentType: art.contentType,
        url: `/${art.contentType}/${art.slug}`,
        description: art.description,
        topic: art.topic,
        tags: art.tags,
      }));

      userPrompt = `Current Article Title: ${publishState?.title || ''}
Current Article Slug: ${publishState?.slug || ''}
Current Article Content HTML:
${articleHtml || ''}

Site Manifest (Available Internal Articles to link to):
${JSON.stringify(manifestSummary, null, 2)}

Instructions:
Identify 2 to 5 high-value internal link Callout Card opportunities. Return ONLY a JSON object formatted as:
{
  "suggestions": [
    {
      "id": "link-1",
      "type": "callout",
      "anchorText": "Top 10 Replit Alternatives",
      "contextExcerpt": "exact phrase from target paragraph where callout should sit",
      "targetSlug": "replit-alternatives",
      "targetTitle": "Top 10 Replit Alternatives in 2026",
      "targetUrl": "/alternatives/replit-alternatives",
      "description": "Full breakdown of top cloud IDE alternatives.",
      "reason": "If you are exploring cloud IDEs, desktop editors, and no-code tools specifically replacing Replit,"
    }
  ]
}`;
    } else if (action === 'external-links') {
      systemInstruction = `You are the Lead Editorial Technical SEO Architect for wethedevs.com.
Identify technical concepts, frameworks, open-source libraries, or official specifications in the article that require high-authority outbound reference links.

EDITORIAL EXTERNAL LINKING PATTERNS:
1. Prefer high-trust official documentation & developer domains (e.g. developer.mozilla.org, docs.github.com, react.dev, nextjs.org, stackblitz.com, schema.org, standard.go).
2. Anchor text MUST be specific technical entities or tool names present in the text (e.g. "StackBlitz's WebContainers", "Shadow DOM", "OpenGraph protocol", "Tailwind CSS").
3. Set "nofollow": true only if linking to unverified third-party commercial tools; set "nofollow": false for official documentation and open-source standards.`;

      userPrompt = `Article Title: ${publishState?.title || ''}
Content HTML:
${articleHtml || ''}

Instructions:
Identify 2 to 4 high-authority external reference opportunities.
Return ONLY a JSON object formatted as:
{
  "suggestions": [
    {
      "id": "ext-1",
      "anchorText": "MDN Web Docs",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      "domain": "developer.mozilla.org",
      "reason": "Authoritative technical reference for JavaScript language standards.",
      "nofollow": false
    }
  ]
}`;
    } else if (action === 'schema') {
      systemInstruction = `You are a JSON-LD structured data architect for technical blogs and developer documentation sites.`;

      userPrompt = `Article Title: ${publishState?.title || ''}
Article Slug: ${publishState?.slug || ''}
Description: ${publishState?.description || ''}
Meta Title: ${publishState?.metaTitle || publishState?.title || ''}
Meta Description: ${publishState?.metaDescription || publishState?.description || ''}
Content HTML:
${articleHtml || ''}

Instructions:
Generate valid Google Rich Snippet JSON-LD schemas suitable for this article.
Always include Article schema. Include FAQPage schema if questions/answers exist in content. Include ItemList if list items exist.
Return ONLY a JSON object formatted as:
{
  "schemas": [
    {
      "type": "Article",
      "jsonLd": {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "${publishState?.metaTitle || publishState?.title || ''}",
        "description": "${publishState?.metaDescription || publishState?.description || ''}"
      },
      "isValid": true,
      "issues": [],
      "applyAction": "meta"
    },
    {
      "type": "FAQPage",
      "jsonLd": { "@context": "https://schema.org", "@type": "FAQPage" },
      "isValid": true,
      "issues": [],
      "applyAction": "faq",
      "faqItems": [
        { "question": "What is Replit?", "answer": "Replit is a cloud IDE..." }
      ]
    }
  ]
}`;
    } else if (action === 'meta-tags') {
      systemInstruction = `You are an expert SEO copywriter specializing in technical content and developer tools.`;

      userPrompt = `Article Title: ${publishState?.title || ''}
Description: ${publishState?.description || ''}
Topic: ${publishState?.topic || ''}
Tags: ${(publishState?.tags || []).join(', ')}
Content HTML:
${(articleHtml || '').slice(0, 4000)}

Instructions:
Optimize the metadata for search engines and social sharing.
Return ONLY a JSON object formatted as:
{
  "metaTitle": {
    "value": "Catchy SEO Title (50-60 chars max)",
    "charCount": 55,
    "isOptimal": true
  },
  "metaDescription": {
    "value": "Compelling Meta Description summarizing value proposition (135-160 chars max)",
    "charCount": 150,
    "isOptimal": true
  },
  "coverAlt": "Descriptive, keyword-rich image alt text",
  "ogTitle": "Social-friendly OpenGraph Title",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;
    } else if (action === 'audit') {
      systemInstruction = `You are a technical SEO auditor evaluating blog post articles for developer tools, comparisons, and technical guides.
CRITICAL SYSTEM NOTE ON STRUCTURED DATA:
The wethedevs site engine automatically builds and injects Article JSON-LD, Breadcrumb JSON-LD, FAQPage JSON-LD, and ItemList JSON-LD into the page <head> upon publication based on:
1. Article title, meta description, and publication date -> Article JSON-LD
2. Any "## FAQ" or "## Frequently asked questions" H2 section with H3/details/paragraph questions -> FAQPage JSON-LD
3. Any numbered or itemized H2 headings (e.g. "## 1. Cursor", "## Replit") -> ItemList JSON-LD

Therefore, if the article has an FAQ section ("## Frequently asked questions" or "## FAQ") or structured H2 headings, Structured Data IS ALREADY FULLY IMPLEMENTED and MUST be marked as severity "pass" with 100% compliance. Do NOT flag missing structured data as an error or warning if standard H2 headings or FAQ sections exist.`;

      userPrompt = `Article Title: ${publishState?.title || ''}
Slug: ${publishState?.slug || ''}
Description: ${publishState?.description || ''}
Meta Title: ${publishState?.metaTitle || ''}
Meta Description: ${publishState?.metaDescription || ''}
Cover Alt: ${publishState?.coverAlt || ''}
Tags: ${(publishState?.tags || []).join(', ')}
Content HTML:
${articleHtml || ''}

Instructions:
Perform a full technical SEO audit covering headings, keyword alignment, meta descriptions, readability, image alt text, and structured data compliance.
Return ONLY a JSON object formatted as:
{
  "score": 92,
  "summary": "Overall evaluation summary of the article's SEO health.",
  "items": [
    {
      "id": "item-1",
      "category": "headings",
      "severity": "pass",
      "title": "H1 Heading Structure",
      "description": "Article has a single clean H1 title.",
      "fix": ""
    }
  ]
}`;
    }

    const geminiResult = await callGeminiApi(apiKey, {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const candidate = geminiResult.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('Gemini API returned an empty response');
    }

    const jsonText = candidate.content.parts[0].text.trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error('Failed to parse Gemini API JSON response');
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('AI SEO Route error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
