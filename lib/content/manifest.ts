import manifestData from '@/content-index.json';
import { ContentManifest, ManifestEntry } from '@/types/content';

export function getManifest(): ContentManifest {
  return manifestData as ContentManifest;
}

/** Get active published articles (excluding drafts) for public listings */
export function getPublicArticles(): ManifestEntry[] {
  return (manifestData as ContentManifest).articles.filter((a) => a.draft !== true);
}
