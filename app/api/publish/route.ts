import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validatePublishPayload } from '@/lib/publishing/validator';
import { serializeMdx } from '@/lib/publishing/serializer';
import { commitAndPushContent } from '@/lib/publishing/git';
import { recordSlugRedirect } from '@/lib/publishing/redirects';
import { generateManifest } from '@/scripts/generate-manifest';

export async function POST(request: Request) {
  try {
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
      const oldDir = path.join(process.cwd(), 'content', contentType, oldSlug);
      if (fs.existsSync(oldDir)) {
        fs.rmSync(oldDir, { recursive: true, force: true });
      }
      recordSlugRedirect(contentType, oldSlug, slug);
    }

    // Serialize to clean MDX text
    const mdxContent = serializeMdx(frontmatter, contentHtml || '');

    // Target directory: content/[contentType]/[slug]/article.mdx
    const targetDir = path.join(process.cwd(), 'content', contentType, slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const mdxFilePath = path.join(targetDir, 'article.mdx');
    fs.writeFileSync(mdxFilePath, mdxContent, 'utf-8');

    // Regenerate content manifest index
    try {
      generateManifest();
    } catch {
      // Manifest fallback
    }

    // Execute Git commit & push
    const gitResult = await commitAndPushContent(slug, contentType);

    return NextResponse.json({
      success: true,
      slug,
      contentType,
      path: `/content/${contentType}/${slug}/article.mdx`,
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
