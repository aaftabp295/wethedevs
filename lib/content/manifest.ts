import fs from 'fs';
import path from 'path';
import { ContentManifest, ManifestEntry } from '@/types/content';
import { getAllArticlesFromFiles, articleToManifestEntry } from './loader';

const MANIFEST_PATH = path.join(process.cwd(), 'content-index.json');

export function generateManifest(): ContentManifest {
  const articles = getAllArticlesFromFiles();
  const manifestEntries: ManifestEntry[] = articles.map(articleToManifestEntry);

  manifestEntries.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const manifest: ContentManifest = {
    articles: manifestEntries,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  return manifest;
}

export function getManifest(): ContentManifest {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return generateManifest();
  }

  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    return JSON.parse(raw) as ContentManifest;
  } catch {
    return generateManifest();
  }
}
