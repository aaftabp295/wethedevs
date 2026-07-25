import simpleGit, { SimpleGit } from 'simple-git';
import path from 'path';

const git: SimpleGit = simpleGit(process.cwd());

export async function commitAndPushContent(
  articleSlug: string,
  contentType: string,
  message?: string
): Promise<{ success: boolean; commitHash?: string; warning?: string }> {
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      return {
        success: true,
        warning: 'Git repository not initialized locally. Content saved to disk.',
      };
    }

    const targetPath = path.join('content', contentType, articleSlug);
    const manifestPath = 'content-index.json';

    await git.add([targetPath, manifestPath]);

    const commitMessage =
      message || `feat(content): publish ${contentType}/${articleSlug}`;
    const commitResult = await git.commit(commitMessage);

    try {
      const remotes = await git.getRemotes();
      if (remotes.length > 0) {
        await git.push();
      }
    } catch {
      // Remote push warning handled gracefully
      return {
        success: true,
        commitHash: commitResult.commit,
        warning: 'Committed locally. Remote git push skipped or no remote configured.',
      };
    }

    return {
      success: true,
      commitHash: commitResult.commit,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Git operation warning';
    return {
      success: true,
      warning: `Saved content locally. Git warning: ${msg}`,
    };
  }
}
