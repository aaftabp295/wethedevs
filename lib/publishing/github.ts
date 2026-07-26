/**
 * GitHub REST API Client for Vercel Serverless Production Deployment
 * Enables 100% online publishing, editing, and deletion from any device anywhere in the world.
 */

interface GitHubFileCommitOptions {
  path: string; // e.g. 'content/alternatives/lovable-alternatives/article.mdx'
  content: string; // Plain text or file content
  message: string; // Commit message
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
const GITHUB_REPO = process.env.GITHUB_REPO; // Format: 'owner/repo'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export function isGitHubApiConfigured(): boolean {
  return Boolean(GITHUB_TOKEN && GITHUB_REPO);
}

/** Get existing file SHA from GitHub repo (required by GitHub API for updates) */
async function getFileSha(path: string): Promise<string | undefined> {
  if (!GITHUB_TOKEN || !GITHUB_REPO) return undefined;

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'WeTheDevs-Publisher',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      return data.sha;
    }
  } catch {
    // Ignore if file is new
  }
  return undefined;
}

/** Commit or update a file directly in GitHub repository via GitHub REST API */
export async function commitFileToGitHub({
  path,
  content,
  message,
}: GitHubFileCommitOptions): Promise<{ success: boolean; commitHash?: string; error?: string }> {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return { success: false, error: 'GITHUB_TOKEN or GITHUB_REPO not configured in environment' };
  }

  try {
    const sha = await getFileSha(path);
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const body: Record<string, unknown> = {
      message,
      content: encodedContent,
      branch: GITHUB_BRANCH,
    };

    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'WeTheDevs-Publisher',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || 'GitHub API commit failed' };
    }

    return {
      success: true,
      commitHash: data.commit?.sha,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'GitHub API error',
    };
  }
}

/** Delete a file directly in GitHub repository via GitHub REST API */
export async function deleteFileFromGitHub(
  path: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return { success: false, error: 'GITHUB_TOKEN or GITHUB_REPO not configured' };
  }

  try {
    const sha = await getFileSha(path);
    if (!sha) {
      return { success: true }; // File already doesn't exist
    }

    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'WeTheDevs-Publisher',
      },
      body: JSON.stringify({
        message,
        sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || 'GitHub API delete failed' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'GitHub delete error' };
  }
}
