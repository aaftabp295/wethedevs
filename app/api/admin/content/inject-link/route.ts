import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateManifest } from '@/scripts/generate-manifest';
import { commitAndPushContent } from '@/lib/publishing/git';
import { getFileFromGitHub } from '@/lib/publishing/github-api';
import { commitMultipleFilesToGitHub, FileChange } from '@/lib/publishing/github';

export type InjectItem = {
  sourceSlug: string;
  sourceContentType: string;
  calloutMarkdown: string;
  contextExcerpt?: string;
};

/**
 * Pure helper function to parse MDX text and insert callout block after paragraph 3
 */
export function injectCalloutIntoMdxText(
  mdxContent: string,
  calloutMarkdown: string,
  contextExcerpt?: string
): { updatedContent: string; alreadyPresent: boolean } {
  const trimmedCallout = calloutMarkdown.trim();

  // Skip duplicate insertion
  if (mdxContent.includes(trimmedCallout)) {
    return { updatedContent: mdxContent, alreadyPresent: true };
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

  blocks.splice(insertIndex, 0, trimmedCallout);
  return { updatedContent: blocks.join('\n\n'), alreadyPresent: false };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const itemsToProcess: InjectItem[] = [];
    const skipPush = body.skipPush === true;
    const githubToken =
      body.githubToken ||
      request.headers.get('x-github-token') ||
      process.env.GITHUB_TOKEN ||
      process.env.GITHUB_PAT ||
      process.env.GH_TOKEN ||
      process.env.NEXT_PUBLIC_GITHUB_TOKEN;

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

    // Determine if environment is Read-Only Serverless (Vercel Production) or Local Dev
    const isServerless =
      process.env.VERCEL ||
      process.env.NODE_ENV === 'production' ||
      Boolean(githubToken && !fs.existsSync(path.join(process.cwd(), 'content')));

    const results: Array<{ sourceSlug: string; success: boolean; alreadyPresent?: boolean; message?: string }> = [];

    if (isServerless) {
      // MODE 1: Serverless Production (Atomic 1-Commit GitHub REST API)
      if (!githubToken) {
        return NextResponse.json(
          {
            error:
              'Live deployment detected (read-only filesystem). Please set GITHUB_TOKEN in your Vercel Environment Variables to allow live content updates.',
          },
          { status: 403 }
        );
      }

      const pendingChanges: FileChange[] = [];

      for (const item of itemsToProcess) {
        const relativePath = `content/${item.sourceContentType}/${item.sourceSlug}/article.mdx`;
        try {
          const { content: currentMdx } = await getFileFromGitHub(relativePath, githubToken);
          const { updatedContent, alreadyPresent } = injectCalloutIntoMdxText(
            currentMdx,
            item.calloutMarkdown,
            item.contextExcerpt
          );

          if (alreadyPresent) {
            results.push({ sourceSlug: item.sourceSlug, success: true, alreadyPresent: true });
            continue;
          }

          pendingChanges.push({
            path: relativePath,
            content: updatedContent,
          });
          results.push({ sourceSlug: item.sourceSlug, success: true });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'GitHub API fetch error';
          results.push({ sourceSlug: item.sourceSlug, success: false, message: msg });
        }
      }

      // Commit ALL modified files in 1 SINGLE ATOMIC GIT COMMIT -> Triggers EXACTLY 1 Vercel Deployment!
      let atomicCommitResult = null;
      if (pendingChanges.length > 0 && !skipPush) {
        const slugList = pendingChanges.map((c) => c.path.split('/')[2]).join(', ');
        atomicCommitResult = await commitMultipleFilesToGitHub({
          changes: pendingChanges,
          message: `feat(seo): batch inject inbound link callouts into ${slugList}`,
          tokenOverride: githubToken,
        });
      }

      return NextResponse.json({
        success: true,
        mode: 'github-api-atomic',
        processedCount: itemsToProcess.length,
        results,
        git: atomicCommitResult,
      });
    } else {
      // MODE 2: Local Development (Local Filesystem + Git)
      for (const item of itemsToProcess) {
        const filePath = path.join(
          process.cwd(),
          'content',
          item.sourceContentType,
          item.sourceSlug,
          'article.mdx'
        );

        if (!fs.existsSync(filePath)) {
          results.push({
            sourceSlug: item.sourceSlug,
            success: false,
            message: `MDX file not found at ${filePath}`,
          });
          continue;
        }

        const currentMdx = fs.readFileSync(filePath, 'utf-8');
        const { updatedContent, alreadyPresent } = injectCalloutIntoMdxText(
          currentMdx,
          item.calloutMarkdown,
          item.contextExcerpt
        );

        if (alreadyPresent) {
          results.push({ sourceSlug: item.sourceSlug, success: true, alreadyPresent: true });
          continue;
        }

        fs.writeFileSync(filePath, updatedContent, 'utf-8');
        results.push({ sourceSlug: item.sourceSlug, success: true });
      }

      // Refresh content-index.json manifest once
      try {
        generateManifest();
      } catch (manifestErr) {
        console.warn('Manifest regeneration warning:', manifestErr);
      }

      let gitResult = null;
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
        mode: 'local-fs',
        processedCount: itemsToProcess.length,
        results,
        git: gitResult,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to inject callout links';
    console.error('Inject Link Route Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
