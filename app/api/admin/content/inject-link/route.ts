import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateManifest } from '@/scripts/generate-manifest';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceSlug, sourceContentType, calloutMarkdown, contextExcerpt } = body;

    if (!sourceSlug || !sourceContentType || !calloutMarkdown) {
      return NextResponse.json(
        { error: 'sourceSlug, sourceContentType, and calloutMarkdown are required.' },
        { status: 400 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      'content',
      sourceContentType,
      sourceSlug,
      'article.mdx'
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Target MDX file not found at ${filePath}` },
        { status: 404 }
      );
    }

    let mdxContent = fs.readFileSync(filePath, 'utf-8');

    // If callout is already present in file, skip to avoid duplicate insertion
    if (mdxContent.includes(calloutMarkdown.trim())) {
      return NextResponse.json({
        success: true,
        alreadyPresent: true,
        message: `Callout card already exists in ${sourceSlug}`,
      });
    }

    // Split MDX file into blocks separated by blank lines (\n\n)
    const blocks = mdxContent.split(/\n\s*\n/);

    // Identify frontmatter boundary (starts and ends with ---)
    let frontmatterEndIndex = 0;
    if (blocks[0]?.trim().startsWith('---')) {
      for (let i = 1; i < blocks.length; i++) {
        if (blocks[i].trim().endsWith('---') || blocks[i].trim() === '---') {
          frontmatterEndIndex = i;
          break;
        }
      }
    }

    // Body blocks start right after frontmatter
    const bodyStartIndex = frontmatterEndIndex + 1;
    // Enforce skipping the first 3 paragraphs (first 3 body blocks)
    const minTargetIndex = Math.min(bodyStartIndex + 3, blocks.length - 1);

    let insertIndex = -1;

    // Strategy A: Find block matching contextExcerpt after paragraph 3
    if (contextExcerpt && contextExcerpt.length >= 3) {
      const searchKw = contextExcerpt.toLowerCase().trim();
      for (let i = minTargetIndex; i < blocks.length; i++) {
        if (blocks[i].toLowerCase().includes(searchKw)) {
          insertIndex = i + 1; // Insert immediately after matching block
          break;
        }
      }
    }

    // Strategy B: If context match fails, insert after paragraph 4 or before FAQ section
    if (insertIndex === -1) {
      // Find FAQ section index if present
      const faqIndex = blocks.findIndex(
        (b, idx) => idx >= minTargetIndex && /^##\s+(FAQ|Frequently)/i.test(b.trim())
      );

      if (faqIndex !== -1) {
        insertIndex = faqIndex; // Insert right before FAQ section
      } else {
        insertIndex = Math.min(minTargetIndex + 1, blocks.length);
      }
    }

    // Insert callout block into blocks array
    blocks.splice(insertIndex, 0, calloutMarkdown.trim());

    const updatedMdx = blocks.join('\n\n');
    fs.writeFileSync(filePath, updatedMdx, 'utf-8');

    // Refresh content-index.json manifest instantly on disk
    try {
      generateManifest();
    } catch (manifestErr) {
      console.warn('Manifest regeneration warning:', manifestErr);
    }

    return NextResponse.json({
      success: true,
      injectedSlug: sourceSlug,
      filePath: `content/${sourceContentType}/${sourceSlug}/article.mdx`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to inject callout link';
    console.error('Inject Link Route Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
