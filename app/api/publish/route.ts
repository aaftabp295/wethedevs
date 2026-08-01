import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { validatePublishPayload } from '@/lib/publishing/validator';
import { serializeMdx } from '@/lib/publishing/serializer';
import { commitAndPushContent } from '@/lib/publishing/git';
import { recordSlugRedirect, getRedirectsFromGitHub } from '@/lib/publishing/redirects';
import { isGitHubApiConfigured, commitMultipleFilesToGitHub, FileChange } from '@/lib/publishing/github';

import { auth } from '@/lib/auth/config';

const IS_VERCEL = process.env.VERCEL === '1';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin login required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentHtml, oldSlug, ...rawFrontmatter } = body;

    const nowIso = new Date().toISOString();
    const existingPublishedAt = rawFrontmatter.publishedAt?.trim();

    // Sanitize optional fields and defaults
    const frontmatterData = {
      ...rawFrontmatter,
      // publishedAt remains constant forever once published
      publishedAt: existingPublishedAt || nowIso,
      // updatedAt is set to current timestamp whenever an existing article is edited
      updatedAt: existingPublishedAt ? nowIso : (rawFrontmatter.updatedAt?.trim() || undefined),
      tags: Array.isArray(rawFrontmatter.tags)
        ? rawFrontmatter.tags
        : typeof rawFrontmatter.tags === 'string' && rawFrontmatter.tags.trim()
        ? [rawFrontmatter.tags.trim()]
        : [],
      cover: rawFrontmatter.cover?.trim() || undefined,
      coverAlt: rawFrontmatter.coverAlt?.trim() || undefined,
      canonical: rawFrontmatter.canonical?.trim() || undefined,
      author: rawFrontmatter.author?.trim() || undefined,
    };

    // Validate frontmatter payload
    const validation = validatePublishPayload(frontmatterData);
    if (!validation.valid || !validation.frontmatter) {
      return NextResponse.json(
        { error: 'Invalid frontmatter payload', details: validation.errors },
        { status: 400 }
      );
    }

    const frontmatter = validation.frontmatter;
    const { slug, contentType } = frontmatter;

    // Handle slug rename & SEO redirect
    const newRedirects = oldSlug && oldSlug !== slug
      ? recordSlugRedirect(contentType, oldSlug, slug)
      : [];

    // Serialize to clean MDX text
    const mdxContent = serializeMdx(frontmatter, contentHtml || '');
    const mdxRelativePath = `content/${contentType}/${slug}/article.mdx`;

    // Mode A: Online Vercel Deployment via GitHub REST API (1 Single Atomic Commit)
    if (isGitHubApiConfigured()) {
      const gitChanges: FileChange[] = [];

      // 1. Add/update the new article MDX file
      gitChanges.push({
        path: mdxRelativePath,
        content: mdxContent,
      });

      // 2. If old slug was renamed, mark old MDX file for deletion (content: undefined)
      if (oldSlug && oldSlug !== slug) {
        gitChanges.push({
          path: `content/${contentType}/${oldSlug}/article.mdx`,
          content: undefined,
        });
      }

      // 3. Update content/redirects.json if there are new redirects
      if (newRedirects.length > 0) {
        const existingRedirects = await getRedirectsFromGitHub();
        const mergedRedirects = [
          ...existingRedirects.filter(
            (r) => !newRedirects.some((nr) => nr.source === r.source)
          ),
          ...newRedirects,
        ];

        gitChanges.push({
          path: 'content/redirects.json',
          content: JSON.stringify(mergedRedirects, null, 2),
        });
      }

      // Commit all changes atomically in 1 single GitHub commit (triggers ONLY 1 Vercel deploy!)
      const commitMessage = oldSlug && oldSlug !== slug
        ? `feat(content): publish ${contentType}/${slug} (renamed from ${oldSlug})`
        : `feat(content): publish ${contentType}/${slug}`;

      const gitCommit = await commitMultipleFilesToGitHub({
        changes: gitChanges,
        message: commitMessage,
      });

      if (!gitCommit.success) {
        return NextResponse.json(
          { error: `GitHub Publish Failed: ${gitCommit.error}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        slug,
        contentType,
        path: mdxRelativePath,
        onlineGithub: true,
        git: gitCommit,
      });
    }

    // Fail-safe: block filesystem writes on Vercel
    if (IS_VERCEL) {
      return NextResponse.json(
        { error: 'GITHUB_TOKEN and GITHUB_REPO env vars required on Vercel' },
        { status: 400 }
      );
    }

    // Mode B: Local Development Environment via Filesystem & Git
    const targetDir = path.join(process.cwd(), 'content', contentType, slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Delete old slug directory if renamed
    if (oldSlug && oldSlug !== slug) {
      const oldDir = path.join(process.cwd(), 'content', contentType, oldSlug);
      if (fs.existsSync(oldDir)) {
        fs.rmSync(oldDir, { recursive: true, force: true });
      }
    }

    const mdxFilePath = path.join(targetDir, 'article.mdx');
    fs.writeFileSync(mdxFilePath, mdxContent, 'utf-8');

    // Regenerate content manifest index (local only)
    try {
      const { generateManifest } = await import('@/scripts/generate-manifest');
      generateManifest();
      revalidatePath('/', 'layout');
      revalidatePath(`/${contentType}`);
      revalidatePath(`/${contentType}/${slug}`);
    } catch {
      // Manifest fallback
    }

    // Execute Git commit & push locally
    const gitResult = await commitAndPushContent(slug, contentType);

    return NextResponse.json({
      success: true,
      slug,
      contentType,
      path: mdxRelativePath,
      git: gitResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Publish error';
    return NextResponse.json(
      { error: 'Failed to publish article', details: message },
      { status: 500 }
    );
  }
}
