import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const contentType = (formData.get('contentType') as string) || 'alternatives';
    const slug = (formData.get('slug') as string) || 'draft';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const targetDir = path.join(process.cwd(), 'content', contentType, slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = file.name.replace(/[^\w.-]/g, '_');
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `./${fileName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fileName,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to upload media file' },
      { status: 500 }
    );
  }
}
