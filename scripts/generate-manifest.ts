import fs from 'fs';
import path from 'path';
import { getAllArticlesFromFiles, articleToManifestEntry } from '../lib/content/loader';
import { validateLinksAndOrphans } from '../lib/seo/validation';
import { ContentManifest, ManifestEntry } from '../types/content';

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

console.log('🚀 Generating content manifest...');
const manifest = generateManifest();
console.log(`✅ Indexed ${manifest.articles.length} articles in content-index.json`);

console.log('🔍 Running link health and orphan page checks...');
const report = validateLinksAndOrphans(manifest);

if (report.brokenLinks.length > 0) {
  console.warn(`⚠️ Warning: Found ${report.brokenLinks.length} broken internal links:`);
  report.brokenLinks.forEach((link) => {
    console.warn(`  - ${link.sourceSlug} -> ${link.targetSlug}`);
  });
} else {
  console.log('✅ 0 broken internal links found.');
}

if (report.orphanPages.length > 0) {
  console.log(`ℹ️ Found ${report.orphanPages.length} orphan pages (no incoming links):`);
  report.orphanPages.forEach((slug) => {
    console.log(`  - ${slug}`);
  });
}

console.log('🎉 Content engine build pipeline completed successfully.');
