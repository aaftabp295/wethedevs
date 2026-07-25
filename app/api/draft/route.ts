import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Drafts are handled locally and in Phase 7 saved to disk as draft MDX files
    return NextResponse.json({
      success: true,
      slug: body.slug || 'draft',
      savedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
