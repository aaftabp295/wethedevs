import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { generateManifest } from '@/scripts/generate-manifest';
import { commitAndPushContent } from '@/lib/publishing/git';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/** DELETE /api/content — Permanently delete an article MDX file and directory */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('contentType');
    const slug = searchParams.get('slug');

    if (!contentType || !slug) {
      return NextResponse.json(
        { error: 'contentType and slug parameters are required' },
        { status: 400 }
      );
    }

    const targetDir = path.join(CONTENT_DIR, contentType, slug);
    if (!fs.existsSync(targetDir)) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Delete target article directory
    fs.rmSync(targetDir, { recursive: true, force: true });

    // Regenerate manifest index
    try {
      generateManifest();
    } catch {
      // Fallback
    }

    // Purge Next.js page cache
    try {
      revalidatePath('/', 'layout');
      revalidatePath(`/${contentType}`);
      revalidatePath(`/${contentType}/${slug}`);
    } catch {
      // Fallback
    }

    // Commit deletion with Git
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
    const body = await request.json();
    const { contentType, slug, draft } = body;

    if (!contentType || !slug || typeof draft !== 'boolean') {
      return NextResponse.json(
        { error: 'contentType, slug, and boolean draft fields are required' },
        { status: 400 }
      );
    }

    const articlePath = path.join(CONTENT_DIR, contentType, slug, 'article.mdx');
    if (!fs.existsSync(articlePath)) {
      return NextResponse.json(
        { error: 'Article MDX file not found' },
        { status: 404 }
      );
    }

    const raw = fs.readFileSync(articlePath, 'utf-8');
    const { data, content } = matter(raw);

    // Update frontmatter draft state
    data.draft = draft;
    if (!draft && !data.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }
    data.updatedAt = new Date().toISOString();

    const updatedMdx = matter.stringify(content, data);
    fs.writeFileSync(articlePath, updatedMdx, 'utf-8');

    // Regenerate manifest index
    try {
      generateManifest();
    } catch {
      // Fallback
    }

    // Purge Next.js page cache
    try {
      revalidatePath('/', 'layout');
      revalidatePath(`/${contentType}`);
      revalidatePath(`/${contentType}/${slug}`);
    } catch {
      // Fallback
    }

    // Execute Git commit
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
