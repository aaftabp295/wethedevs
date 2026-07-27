import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isGitHubApiConfigured, commitFileToGitHub } from '@/lib/publishing/github';
import { auth } from '@/lib/auth/config';

const IS_VERCEL = process.env.VERCEL === '1';

/**
 * POST /api/media — Upload cover image / article image
 * On Vercel: Commits image file directly to GitHub repo under public/images/covers/
 * On Local: Saves image file to public/images/covers/ on disk
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin login required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const slug = (formData.get('slug') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PNG, JPG, WebP, AVIF, or SVG image.' },
        { status: 400 }
      );
    }

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate clean filename: {slug}-{timestamp}.{ext}
    const rawExt = file.name.split('.').pop() || 'png';
    const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const timestamp = Date.now();
    const filename = `${cleanSlug}-${timestamp}.${ext}`;

    const githubRelativePath = `public/images/covers/${filename}`;
    const publicUrl = `/images/covers/${filename}`;

    // Mode A: Online Vercel Deployment via GitHub REST API
    if (isGitHubApiConfigured()) {
      const base64Content = buffer.toString('base64');
      const gitResult = await commitFileToGitHub({
        path: githubRelativePath,
        content: base64Content,
        message: `chore(media): upload cover image for ${slug}`,
      });

      if (!gitResult.success) {
        return NextResponse.json(
          { error: `GitHub image upload failed: ${gitResult.error}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename,
        git: gitResult,
      });
    }

    // Fail-safe: block filesystem writes on Vercel
    if (IS_VERCEL) {
      return NextResponse.json(
        { error: 'GITHUB_TOKEN and GITHUB_REPO env vars required on Vercel' },
        { status: 400 }
      );
    }

    // Mode B: Local Development Environment via Filesystem
    const targetDir = path.join(process.cwd(), 'public', 'images', 'covers');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image upload failed';
    return NextResponse.json(
      { error: 'Failed to upload image', details: message },
      { status: 500 }
    );
  }
}
