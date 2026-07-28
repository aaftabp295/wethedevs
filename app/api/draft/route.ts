import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { auth } from '@/lib/auth/config';
import { serializeMdx } from '@/lib/publishing/serializer';
import { validatePublishPayload } from '@/lib/publishing/validator';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return new Response('Unauthorized: Admin authentication required to access draft preview', {
      status: 401,
    });
  }

  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get('contentType');
  const slug = searchParams.get('slug');

  if (!contentType || !slug) {
    return new Response('Missing contentType or slug parameters', { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(`/${contentType}/${slug}`);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentHtml, oldSlug, ...rawFrontmatter } = body;

    const frontmatterData = {
      ...rawFrontmatter,
      draft: true,
      publishedAt: rawFrontmatter.publishedAt || new Date().toISOString(),
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

    const validation = validatePublishPayload(frontmatterData);
    if (!validation.valid || !validation.frontmatter) {
      return NextResponse.json({ error: 'Invalid frontmatter payload', details: validation.errors }, { status: 400 });
    }

    const frontmatter = validation.frontmatter;
    const { slug, contentType } = frontmatter;

    const mdxContent = serializeMdx(frontmatter, contentHtml || '');

    // Write file locally to disk WITHOUT Git commit or push
    const targetDir = path.join(process.cwd(), 'content', contentType, slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const mdxFilePath = path.join(targetDir, 'article.mdx');
    fs.writeFileSync(mdxFilePath, mdxContent, 'utf-8');

    // Regenerate local content manifest index
    try {
      const { generateManifest } = await import('@/scripts/generate-manifest');
      generateManifest();
    } catch {
      // Ignore
    }

    // Enable Next.js Draft Mode
    const draft = await draftMode();
    draft.enable();

    return NextResponse.json({
      success: true,
      previewUrl: `/${contentType}/${slug}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Draft preview error';
    return NextResponse.json({ error: 'Failed to save draft for preview', details: message }, { status: 500 });
  }
}
