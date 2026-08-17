import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateManifest } from '@/scripts/generate-manifest';
import { commitAndPushContent } from '@/lib/publishing/git';

export type InjectItem = {
  sourceSlug: string;
  sourceContentType: string;
  calloutMarkdown: string;
  contextExcerpt?: string;
};

function injectSingleItem(item: InjectItem): { success: boolean; message?: string } {
  const { sourceSlug, sourceContentType, calloutMarkdown, contextExcerpt } = item;

  const filePath = path.join(
    process.cwd(),
    'content',
    sourceContentType,
    sourceSlug,
    'article.mdx'
  );

  if (!fs.existsSync(filePath)) {
    return { success: false, message: `MDX file not found at ${filePath}` };
  }

  let mdxContent = fs.readFileSync(filePath, 'utf-8');

  // If callout is already present in file, skip to avoid duplicate insertion
  if (mdxContent.includes(calloutMarkdown.trim())) {
    return { success: true, message: `Already present in ${sourceSlug}` };
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

  const bodyStartIndex = frontmatterEndIndex + 1;
  const minTargetIndex = Math.min(bodyStartIndex + 3, blocks.length - 1);

  let insertIndex = -1;

  // Strategy A: Find block matching contextExcerpt after paragraph 3
  if (contextExcerpt && contextExcerpt.length >= 3) {
    const searchKw = contextExcerpt.toLowerCase().trim();
    for (let i = minTargetIndex; i < blocks.length; i++) {
      if (blocks[i].toLowerCase().includes(searchKw)) {
        insertIndex = i + 1;
        break;
      }
    }
  }

  // Strategy B: If context match fails, insert after paragraph 4 or before FAQ section
  if (insertIndex === -1) {
    const faqIndex = blocks.findIndex(
      (b, idx) => idx >= minTargetIndex && /^##\s+(FAQ|Frequently)/i.test(b.trim())
    );

    if (faqIndex !== -1) {
      insertIndex = faqIndex;
    } else {
      insertIndex = Math.min(minTargetIndex + 1, blocks.length);
    }
  }

  blocks.splice(insertIndex, 0, calloutMarkdown.trim());
  const updatedMdx = blocks.join('\n\n');
  fs.writeFileSync(filePath, updatedMdx, 'utf-8');

  return { success: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const itemsToProcess: InjectItem[] = [];
    const skipPush = body.skipPush === true;

    if (Array.isArray(body.items)) {
      itemsToProcess.push(...body.items);
    } else if (body.sourceSlug && body.sourceContentType && body.calloutMarkdown) {
      itemsToProcess.push({
        sourceSlug: body.sourceSlug,
        sourceContentType: body.sourceContentType,
        calloutMarkdown: body.calloutMarkdown,
        contextExcerpt: body.contextExcerpt,
      });
    }

    if (itemsToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No valid items provided for link injection.' },
        { status: 400 }
      );
    }

    const results: Array<{ sourceSlug: string; success: boolean; message?: string }> = [];

    // Process all MDX files on disk in a single batch
    for (const item of itemsToProcess) {
      const res = injectSingleItem(item);
      results.push({ sourceSlug: item.sourceSlug, ...res });
    }

    // Refresh content-index.json manifest once for the entire batch
    try {
      generateManifest();
    } catch (manifestErr) {
      console.warn('Manifest regeneration warning:', manifestErr);
    }

    let gitResult = null;
    // Commit and push once to GitHub for the entire batch if skipPush is not set
    if (!skipPush) {
      try {
        const slugList = itemsToProcess.map((i) => i.sourceSlug).join(', ');
        gitResult = await commitAndPushContent(
          itemsToProcess[0].sourceSlug,
          itemsToProcess[0].sourceContentType,
          `feat(seo): batch inject inbound link callouts into ${slugList}`
        );
      } catch (gitErr) {
        console.warn('Git push warning:', gitErr);
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: itemsToProcess.length,
      results,
      git: gitResult,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to inject callout links';
    console.error('Inject Link Route Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
