import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';

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
