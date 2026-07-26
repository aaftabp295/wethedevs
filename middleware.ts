import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.AUTH_SECRET || 'dev-secret-wethedevs-key-123456789';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isSecure = req.url.startsWith('https://');

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token =
      (await getToken({ req, secret, secureCookie: isSecure })) ||
      (await getToken({ req, secret, secureCookie: false })) ||
      (await getToken({ req, secret, secureCookie: true }));

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect sensitive publishing & management API endpoints
  if (pathname.startsWith('/api/publish') || pathname.startsWith('/api/content')) {
    const token =
      (await getToken({ req, secret, secureCookie: isSecure })) ||
      (await getToken({ req, secret, secureCookie: false })) ||
      (await getToken({ req, secret, secureCookie: true }));

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/publish', '/api/content'],
};
