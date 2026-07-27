/**
 * GitHub REST API Client for Vercel Serverless Production Deployment
 * Enables 100% online publishing, editing, and deletion from any device anywhere in the world.
 */

export interface FileChange {
  path: string;
  content?: string; // If omitted/null, file will be deleted
}

interface GitHubFileCommitOptions {
  path: string; // e.g. 'content/alternatives/lovable-alternatives/article.mdx'
  content: string; // Plain text or file content
  message: string; // Commit message
}

function getGitHubConfig() {
  const token = (process.env.GITHUB_TOKEN || process.env.GITHUB_PAT)?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = (process.env.GITHUB_BRANCH || 'main').trim();

  return { token, repo, branch };
}

export function isGitHubApiConfigured(): boolean {
  const { token, repo } = getGitHubConfig();
  return Boolean(token && repo);
}

/** Get existing file SHA from GitHub repo (required by GitHub API for single file updates) */
async function getFileSha(path: string): Promise<string | undefined> {
  const { token, repo, branch } = getGitHubConfig();
  if (!token || !repo) return undefined;

  try {
    const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
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

/** Fetch a file's raw text content from GitHub repo */
export async function getFileContentFromGitHub(
  filePath: string
): Promise<string | null> {
  const { token, repo, branch } = getGitHubConfig();
  if (!token || !repo) return null;

  try {
    const url = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'WeTheDevs-Publisher',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.content && data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Commit multiple file changes (creates, updates, and deletes) in 1 SINGLE ATOMIC COMMIT.
 * Prevents multiple Vercel deployments when publishing, renaming, or updating redirects!
 */
export async function commitMultipleFilesToGitHub({
  changes,
  message,
}: {
  changes: FileChange[];
  message: string;
}): Promise<{ success: boolean; commitHash?: string; error?: string }> {
  const { token, repo, branch } = getGitHubConfig();
  if (!token || !repo) {
    return { success: false, error: 'GITHUB_TOKEN or GITHUB_REPO not configured in environment' };
  }

  if (changes.length === 0) {
    return { success: true };
  }

  // Fallback to single commit if only 1 file is being added/updated
  if (changes.length === 1 && changes[0].content !== undefined) {
    return commitFileToGitHub({
      path: changes[0].path,
      content: changes[0].content,
      message,
    });
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'WeTheDevs-Publisher',
    };

    // 1. Get latest commit SHA on branch
    const refRes = await fetch(
      `https://api.github.com/repos/${repo}/git/ref/heads/${branch}`,
      { headers, cache: 'no-store' }
    );
    if (!refRes.ok) {
      const data = await refRes.json();
      return { success: false, error: data.message || 'Failed to fetch branch ref' };
    }
    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // 2. Get tree SHA for latest commit
    const commitRes = await fetch(
      `https://api.github.com/repos/${repo}/git/commits/${latestCommitSha}`,
      { headers, cache: 'no-store' }
    );
    if (!commitRes.ok) {
      const data = await commitRes.json();
      return { success: false, error: data.message || 'Failed to fetch commit tree' };
    }
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;

    // 3. Build tree payload items
    const treeItems = changes.map((c) => {
      if (c.content === undefined || c.content === null) {
        // File deletion in Git tree API
        return {
          path: c.path,
          mode: '100644',
          type: 'blob',
          sha: null,
        };
      }
      return {
        path: c.path,
        mode: '100644',
        type: 'blob',
        content: c.content,
      };
    });

    // 4. Create new tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${repo}/git/trees`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeItems,
        }),
      }
    );
    if (!treeRes.ok) {
      const data = await treeRes.json();
      return { success: false, error: data.message || 'Failed to create Git tree' };
    }
    const treeData = await treeRes.json();

    // 5. Create new commit
    const newCommitRes = await fetch(
      `https://api.github.com/repos/${repo}/git/commits`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          tree: treeData.sha,
          parents: [latestCommitSha],
        }),
      }
    );
    if (!newCommitRes.ok) {
      const data = await newCommitRes.json();
      return { success: false, error: data.message || 'Failed to create Git commit' };
    }
    const newCommitData = await newCommitRes.json();

    // 6. Update branch ref to point to new commit
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${repo}/git/refs/heads/${branch}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: newCommitData.sha,
          force: false,
        }),
      }
    );
    if (!updateRefRes.ok) {
      const data = await updateRefRes.json();
      return { success: false, error: data.message || 'Failed to update branch ref' };
    }

    return {
      success: true,
      commitHash: newCommitData.sha,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'GitHub atomic commit failed',
    };
  }
}

/** Commit or update a file directly in GitHub repository via GitHub REST API */
export async function commitFileToGitHub({
  path,
  content,
  message,
}: GitHubFileCommitOptions): Promise<{ success: boolean; commitHash?: string; error?: string }> {
  const { token, repo, branch } = getGitHubConfig();
  if (!token || !repo) {
    return { success: false, error: 'GITHUB_TOKEN or GITHUB_REPO not configured in environment' };
  }

  try {
    const sha = await getFileSha(path);
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const body: Record<string, unknown> = {
      message,
      content: encodedContent,
      branch,
    };

    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'WeTheDevs-Publisher',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || `GitHub API error (${res.status})` };
    }

    return {
      success: true,
      commitHash: data.commit?.sha,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'GitHub API request failed',
    };
  }
}

/** Delete a file directly in GitHub repository via GitHub REST API */
export async function deleteFileFromGitHub(
  path: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const { token, repo, branch } = getGitHubConfig();
  if (!token || !repo) {
    return { success: false, error: 'GITHUB_TOKEN or GITHUB_REPO not configured in environment' };
  }

  try {
    const sha = await getFileSha(path);
    if (!sha) {
      return { success: true }; // File already doesn't exist
    }

    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'WeTheDevs-Publisher',
      },
      body: JSON.stringify({
        message,
        sha,
        branch,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || `GitHub API delete failed (${res.status})` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'GitHub delete error' };
  }
}
