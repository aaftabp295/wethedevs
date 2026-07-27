import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

/**
 * GET /api/debug-github
 * Debug endpoint to test GitHub API connectivity from Vercel.
 * Protected by admin auth. Remove this file after debugging.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = (process.env.GITHUB_TOKEN || process.env.GITHUB_PAT)?.trim();
    const repo = process.env.GITHUB_REPO?.trim();
    const branch = (process.env.GITHUB_BRANCH || 'main').trim();

    const diagnostics: Record<string, unknown> = {
      GITHUB_TOKEN_set: Boolean(token),
      GITHUB_TOKEN_length: token?.length ?? 0,
      GITHUB_TOKEN_prefix: token ? token.substring(0, 6) + '...' : 'NOT SET',
      GITHUB_REPO: repo || 'NOT SET',
      GITHUB_BRANCH: branch,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL || 'NOT SET',
    };

    // Test: Can we authenticate with GitHub?
    if (token) {
      const authRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'WeTheDevs-Publisher',
        },
        cache: 'no-store',
      });

      const authData = await authRes.json();
      diagnostics.github_auth_status = authRes.status;
      diagnostics.github_user = authRes.ok ? authData.login : authData.message;
    }

    // Test: Can we read the repo?
    if (token && repo) {
      const repoRes = await fetch(`https://api.github.com/repos/${repo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'WeTheDevs-Publisher',
        },
        cache: 'no-store',
      });

      const repoData = await repoRes.json();
      diagnostics.repo_access_status = repoRes.status;
      diagnostics.repo_accessible = repoRes.ok;
      diagnostics.repo_permissions = repoRes.ok ? repoData.permissions : repoData.message;
      diagnostics.repo_default_branch = repoRes.ok ? repoData.default_branch : undefined;
    }

    // Test: Can we read content-index.json?
    if (token && repo) {
      const fileRes = await fetch(
        `https://api.github.com/repos/${repo}/contents/content-index.json?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'WeTheDevs-Publisher',
          },
          cache: 'no-store',
        }
      );

      diagnostics.file_read_status = fileRes.status;
      diagnostics.file_readable = fileRes.ok;
      if (!fileRes.ok) {
        const fileData = await fileRes.json();
        diagnostics.file_read_error = fileData.message;
      }
    }

    return NextResponse.json({ diagnostics });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
