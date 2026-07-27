import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateManifest } from '@/scripts/generate-manifest';
import { commitAndPushContent } from '@/lib/publishing/git';
import { isGitHubApiConfigured, commitFileToGitHub, deleteFileFromGitHub, getFileContentFromGitHub } from '@/lib/publishing/github';

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
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    // Mode A: Online Vercel Deployment via GitHub REST API
    if (isGitHubApiConfigured()) {
      const gitResult = await deleteFileFromGitHub(
        mdxRelativePath,
        `chore(content): delete ${contentType}/${slug}`
      );

      if (!gitResult.success) {
        return NextResponse.json(
          { error: `GitHub Delete Failed: ${gitResult.error}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Article /${contentType}/${slug} deleted via GitHub API`,
        git: gitResult,
      });
    }

    // Fail-safe check for Vercel production
    if (isVercel) {
      return NextResponse.json(
        { error: 'GitHub Integration Unconfigured: GITHUB_TOKEN and GITHUB_REPO environment variables are required in Vercel settings.' },
        { status: 400 }
      );
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

    const mdxRelativePath = `content/${contentType}/${slug}/article.mdx`;
    const articlePath = path.join(CONTENT_DIR, contentType, slug, 'article.mdx');
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

    // Read and parse frontmatter — from GitHub or local FS depending on mode
    let rawMdx: string | null = null;

    if (isGitHubApiConfigured()) {
      // Mode A: Fetch file content directly from GitHub repo
      rawMdx = await getFileContentFromGitHub(mdxRelativePath);
      if (!rawMdx) {
        return NextResponse.json(
          { error: `Article file not found in GitHub repo: ${mdxRelativePath}` },
          { status: 404 }
        );
      }
    } else if (isVercel) {
      return NextResponse.json(
        { error: 'GitHub Integration Unconfigured: GITHUB_TOKEN and GITHUB_REPO environment variables are required in Vercel settings.' },
        { status: 400 }
      );
    } else {
      // Mode B: Read from local filesystem
      if (!fs.existsSync(articlePath)) {
        return NextResponse.json(
          { error: 'Article MDX file not found' },
          { status: 404 }
        );
      }
      rawMdx = fs.readFileSync(articlePath, 'utf-8');
    }

    const parsed = matter(rawMdx);
    const data = parsed.data;
    const content = parsed.content;

    data.draft = draft;
    if (!draft && !data.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }
    data.updatedAt = new Date().toISOString();

    const updatedMdx = matter.stringify(content, data);

    // Mode A: Commit updated file to GitHub
    if (isGitHubApiConfigured()) {
      const gitResult = await commitFileToGitHub({
        path: mdxRelativePath,
        content: updatedMdx,
        message: `chore(content): set draft=${draft} for ${contentType}/${slug}`,
      });

      if (!gitResult.success) {
        return NextResponse.json(
          { error: `GitHub Draft Update Failed: ${gitResult.error}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        draft,
        slug,
        contentType,
        git: gitResult,
      });
    }

    // Mode B: Write to local filesystem & Git
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
