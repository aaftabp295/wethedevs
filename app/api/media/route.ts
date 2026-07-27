import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, uploadToSupabaseStorage } from '@/lib/storage/supabase';
import { auth } from '@/lib/auth/config';

const IS_VERCEL = process.env.VERCEL === '1';

/**
 * POST /api/media — Upload cover image / article image
 * Primary Mode: Uploads to Supabase Storage (100% Free, instant CDN URL, zero git bloat)
 * Fail-safe Local Mode: Saves image file to public/images/covers/ on local disk if Supabase is not set up
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

    // Mode A: Supabase Cloud Storage (Fastest, zero credit card, 100% free CDN)
    if (isSupabaseConfigured()) {
      const uploadResult = await uploadToSupabaseStorage({
        fileBuffer: buffer,
        filename,
        contentType: file.type,
      });

      if (!uploadResult.success || !uploadResult.url) {
        return NextResponse.json(
          { error: `Supabase upload failed: ${uploadResult.error}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: uploadResult.url,
        filename,
        provider: 'supabase',
      });
    }

    // Fail-safe: block filesystem writes on Vercel if Supabase is missing
    if (IS_VERCEL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY required on Vercel' },
        { status: 400 }
      );
    }

    // Mode B: Local Development Environment Fallback via Filesystem
    const targetDir = path.join(process.cwd(), 'public', 'images', 'covers');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/images/covers/${filename}`,
      filename,
      provider: 'local',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image upload failed';
    return NextResponse.json(
      { error: 'Failed to upload image', details: message },
      { status: 500 }
    );
  }
}
