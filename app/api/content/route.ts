import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateManifest } from '@/scripts/generate-manifest';
import { commitAndPushContent } from '@/lib/publishing/git';
import { isGitHubApiConfigured, commitFileToGitHub, deleteFileFromGitHub } from '@/lib/publishing/github';

import { auth } from '@/lib/auth/config';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/** DELETE /api/content — Delete an article MDX file */
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const slug = searchParams.get('slug');

    if (!contentType || !slug) {
      return NextResponse.json(
        { error: 'contentType and slug parameters are required' },
        { status: 400 }
      );
    }

    const mdxRelativePath = `content/${contentType}/${slug}/article.mdx`;

    // Mode A: Online Vercel Deployment via GitHub REST API
    if (isGitHubApiConfigured()) {
      const gitResult = await deleteFileFromGitHub(
        mdxRelativePath,
        `chore(content): delete ${contentType}/${slug}`
      );

      return NextResponse.json({
        success: true,
        message: `Article /${contentType}/${slug} deleted via GitHub API`,
        git: gitResult,
      });
    }

    // Mode B: Local Development Environment via Filesystem & Git
    const targetDir = path.join(CONTENT_DIR, contentType, slug);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }

    try {
      generateManifest();
      revalidatePath('/', 'layout');
      revalidatePath(`/${contentType}`);
      revalidatePath(`/${contentType}/${slug}`);
    } catch {
      // Fallback
    }

    const gitResult = await commitAndPushContent(slug, contentType);

    return NextResponse.json({
      success: true,
      message: `Article /${contentType}/${slug} deleted successfully`,
      git: gitResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete error';
    return NextResponse.json(
      { error: 'Failed to delete article', details: message },
      { status: 500 }
    );
  }
}

/** PATCH /api/content — Toggle draft status (Live -> Draft or Draft -> Live) */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contentType, slug, draft } = body;

    if (!contentType || !slug || typeof draft !== 'boolean') {
      return NextResponse.json(
        { error: 'contentType, slug, and boolean draft fields are required' },
        { status: 400 }
      );
    }

    const articlePath = path.join(CONTENT_DIR, contentType, slug, 'article.mdx');
    const mdxRelativePath = `content/${contentType}/${slug}/article.mdx`;

    if (!fs.existsSync(articlePath) && !isGitHubApiConfigured()) {
      return NextResponse.json(
        { error: 'Article MDX file not found' },
        { status: 404 }
      );
    }

    // Read and parse frontmatter
    let content = '';
    let data: Record<string, unknown> = {};

    if (fs.existsSync(articlePath)) {
      const raw = fs.readFileSync(articlePath, 'utf-8');
      const parsed = matter(raw);
      data = parsed.data;
      content = parsed.content;
    }

    data.draft = draft;
    if (!draft && !data.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }
    data.updatedAt = new Date().toISOString();

    const updatedMdx = matter.stringify(content, data);

    // Mode A: Online Vercel Deployment via GitHub REST API
    if (isGitHubApiConfigured()) {
      const gitResult = await commitFileToGitHub({
        path: mdxRelativePath,
        content: updatedMdx,
        message: `chore(content): update draft status to ${draft} for ${contentType}/${slug}`,
      });

      return NextResponse.json({
        success: true,
        draft,
        slug,
        contentType,
        git: gitResult,
      });
    }

    // Mode B: Local Filesystem & Git
    fs.writeFileSync(articlePath, updatedMdx, 'utf-8');

    try {
      generateManifest();
      revalidatePath('/', 'layout');
      revalidatePath(`/${contentType}`);
      revalidatePath(`/${contentType}/${slug}`);
    } catch {
      // Fallback
    }

    const gitResult = await commitAndPushContent(slug, contentType);

    return NextResponse.json({
      success: true,
      draft,
      slug,
      contentType,
      git: gitResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update error';
    return NextResponse.json(
      { error: 'Failed to update article draft status', details: message },
      { status: 500 }
    );
  }
}
