import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { validatePublishPayload } from '@/lib/publishing/validator';
import { serializeMdx } from '@/lib/publishing/serializer';
import { commitAndPushContent } from '@/lib/publishing/git';
import { recordSlugRedirect, getRedirects } from '@/lib/publishing/redirects';
import { generateManifest } from '@/scripts/generate-manifest';
import { isGitHubApiConfigured, commitFileToGitHub, deleteFileFromGitHub } from '@/lib/publishing/github';

import { auth } from '@/lib/auth/config';

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

    // Sanitize optional fields and defaults
    const frontmatterData = {
      ...rawFrontmatter,
      publishedAt: rawFrontmatter.publishedAt || new Date().toISOString(),
      tags: Array.isArray(rawFrontmatter.tags)
        ? rawFrontmatter.tags
        : typeof rawFrontmatter.tags === 'string' && rawFrontmatter.tags.trim()
        ? [rawFrontmatter.tags.trim()]
        : [],
      cover: rawFrontmatter.cover?.trim() || undefined,
      canonical: rawFrontmatter.canonical?.trim() || undefined,
      author: rawFrontmatter.author?.trim() || undefined,
      updatedAt: rawFrontmatter.updatedAt?.trim() || undefined,
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
    if (oldSlug && oldSlug !== slug) {
      recordSlugRedirect(contentType, oldSlug, slug);

      if (!isGitHubApiConfigured()) {
        const oldDir = path.join(process.cwd(), 'content', contentType, oldSlug);
        if (fs.existsSync(oldDir)) {
          fs.rmSync(oldDir, { recursive: true, force: true });
        }
      }
    }

    // Serialize to clean MDX text
    const mdxContent = serializeMdx(frontmatter, contentHtml || '');
    const mdxRelativePath = `content/${contentType}/${slug}/article.mdx`;

    // Mode A: Online Vercel Deployment via GitHub REST API
    if (isGitHubApiConfigured()) {
      // 1. Commit article MDX file to GitHub
      const mdxCommit = await commitFileToGitHub({
        path: mdxRelativePath,
        content: mdxContent,
        message: `feat(content): publish ${contentType}/${slug}`,
      });

      // 2. If old slug was renamed, delete old file from GitHub
      if (oldSlug && oldSlug !== slug) {
        await deleteFileFromGitHub(
          `content/${contentType}/${oldSlug}/article.mdx`,
          `fix(content): rename slug from ${oldSlug} to ${slug}`
        );
      }

      // 3. Update content/redirects.json on GitHub
      const redirectsList = getRedirects();
      if (redirectsList.length > 0) {
        await commitFileToGitHub({
          path: 'content/redirects.json',
          content: JSON.stringify(redirectsList, null, 2),
          message: `chore(seo): update redirects for ${slug}`,
        });
      }

      return NextResponse.json({
        success: true,
        slug,
        contentType,
        path: mdxRelativePath,
        onlineGithub: true,
        git: mdxCommit,
      });
    }

    // Mode B: Local Development Environment via Filesystem & Git
    const targetDir = path.join(process.cwd(), 'content', contentType, slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const mdxFilePath = path.join(targetDir, 'article.mdx');
    fs.writeFileSync(mdxFilePath, mdxContent, 'utf-8');

    // Regenerate content manifest index
    try {
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
