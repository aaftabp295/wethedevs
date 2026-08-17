const GITHUB_OWNER = process.env.GITHUB_OWNER || 'aaftabp295';
const GITHUB_REPO = process.env.GITHUB_REPO || process.env.NEXT_PUBLIC_GITHUB_REPO || 'aaftabp295/wethedevs';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

function getGitHubToken(tokenOverride?: string): string | undefined {
  if (tokenOverride && tokenOverride.trim()) return tokenOverride.trim();
  return (
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PAT ||
    process.env.GH_TOKEN ||
    process.env.NEXT_PUBLIC_GITHUB_TOKEN
  )?.trim();
}

function getRepoPath(): { owner: string; repo: string } {
  if (GITHUB_REPO.includes('/')) {
    const [owner, repo] = GITHUB_REPO.split('/');
    return { owner, repo };
  }
  return { owner: GITHUB_OWNER, repo: GITHUB_REPO };
}

export async function getFileFromGitHub(filePath: string, token?: string) {
  const ghToken = getGitHubToken(token);
  if (!ghToken) {
    throw new Error('GITHUB_TOKEN environment variable is required for live deployment injection. Please set GITHUB_TOKEN in Vercel settings.');
  }

  const { owner, repo } = getRepoPath();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ghToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'wethedevs-seo-agent',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${filePath} from GitHub API: HTTP ${res.status}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

export async function updateFileOnGitHub(
  filePath: string,
  newContent: string,
  commitMessage: string,
  sha: string,
  token?: string
) {
  const ghToken = getGitHubToken(token);
  if (!ghToken) {
    throw new Error('GITHUB_TOKEN environment variable is required for live deployment injection. Please set GITHUB_TOKEN in Vercel settings.');
  }

  const { owner, repo } = getRepoPath();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const base64Content = Buffer.from(newContent, 'utf-8').toString('base64');

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${ghToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'wethedevs-seo-agent',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to update ${filePath} on GitHub API: HTTP ${res.status}`);
  }

  return await res.json();
}
